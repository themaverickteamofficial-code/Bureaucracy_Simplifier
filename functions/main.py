
import firebase_admin
import firebase_functions.options
from firebase_functions import https_fn
from firebase_admin import storage
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from google.cloud import documentai_v1 as documentai
from google.cloud import storage as gcs
import functions_framework
import os
import uuid
from werkzeug.utils import secure_filename

# --- Configuration ---
GCP_PROJECT = os.getenv("GCP_PROJECT")
GCP_LOCATION = os.getenv("GCP_LOCATION")
DOCAI_PROCESSOR_ID = os.getenv("DOCAI_PROCESSOR_ID")
MODEL_NAME = os.getenv("MODEL_NAME")
TEMP_BUCKET_NAME = "temp-docs"

# --- Initialization ---
# Set the region for all functions if available
if GCP_LOCATION:
    firebase_functions.options.set_global_options(region=GCP_LOCATION)

# Initialize Firebase and Vertex AI
firebase_admin.initialize_app()
if GCP_PROJECT and GCP_LOCATION:
    vertexai.init(project=GCP_PROJECT, location=GCP_LOCATION)

# Initialize Cloud clients
docai_client = documentai.DocumentProcessorServiceClient()
storage_client = gcs.Client()

# --- AI System Instruction ---
AI_SYSTEM_INSTRUCTION = """
You are a helpful Bureaucracy Simplifier. You are NOT a lawyer and you must not provide legal advice.
Your role is to read the text from a government document and explain it in plain, easy-to-understand language, at a 5th-grade reading level.
Your tone should be empathetic but objective.

CRITICAL PRIVACY RULE: Do not output, repeat, or mention any Personally Identifiable Information (PII) found in the text. This includes names, addresses, identification numbers, or any other personal details. Redact and ignore all PII.

Your task is to analyze the document and provide a structured response in JSON format with the following keys:
- "summary": A brief, simple summary of what the document is about.
- "action_items": A list of clear, actionable steps the user might need to take. If there are no actions, return an empty list.
- "missing_info": A list of any information that seems to be missing or that the user might need to find.
- "disclaimer": Always include the string: "This is a simplified explanation and not legal advice. Please consult with a professional for specific guidance."
"""

@https_fn.on_request()
def simplify_document(req: https_fn.Request) -> https_fn.Response:
    """
    Orchestrates the document simplification process via an HTTP request.
    """
    # --- CORS Headers ---
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204, headers=headers)

    # --- Environment Variable Check ---
    if not all([GCP_PROJECT, GCP_LOCATION, DOCAI_PROCESSOR_ID, MODEL_NAME]):
        print("Error: Missing required environment variables (GCP_PROJECT, GCP_LOCATION, DOCAI_PROCESSOR_ID, MODEL_NAME).")
        return https_fn.Response("Server configuration error.", status=500, headers=headers)

    if 'file' not in req.files:
        return https_fn.Response("File not provided.", status=400, headers=headers)

    file = req.files['file']
    if file.filename == '':
        return https_fn.Response("File not provided.", status=400, headers=headers)

    # Secure the filename and create a unique path
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}-{filename}"
    gcs_uri = f"gs://{TEMP_BUCKET_NAME}/{unique_filename}"
    
    blob = None # Initialize blob to None
    try:
        # 3. Storage: Save file to temporary GCS bucket
        bucket = storage_client.bucket(TEMP_BUCKET_NAME)
        blob = bucket.blob(unique_filename)
        blob.upload_from_file(file.stream, content_type=file.content_type)

        # 4. OCR: Call Document AI to extract raw text
        processor_name = docai_client.processor_path(GCP_PROJECT, GCP_LOCATION, DOCAI_PROCESSOR_ID)
        
        gcs_document = documentai.GcsDocument(
            gcs_uri=gcs_uri, mime_type=file.content_type
        )
        request = documentai.ProcessRequest(
            name=processor_name,
            gcs_document=gcs_document,
        )
        result = docai_client.process_document(request=request)
        extracted_text = result.document.text

        # 5. AI Analysis: Send text to Gemini 1.5 Flash
        model = GenerativeModel(
            MODEL_NAME, system_instruction=AI_SYSTEM_INSTRUCTION
        )
        response_schema = {
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "action_items": {"type": "array", "items": {"type": "string"}},
                "missing_info": {"type": "array", "items": {"type": "string"}},
                "disclaimer": {"type": "string"},
            },
            "required": ["summary", "action_items", "missing_info", "disclaimer"]
        }
        
        generation_config = {
            "response_mime_type": "application/json",
            "response_schema": response_schema,
        }
        
        ai_response = model.generate_content(
            extracted_text, generation_config=generation_config
        )

        # 6. Response: Return structured JSON to the frontend
        return https_fn.Response(ai_response.text, status=200, headers=headers, mimetype="application/json")

    except Exception as e:
        print(f"Error processing document: {e}")
        return https_fn.Response("An internal error occurred.", status=500, headers=headers)
    finally:
        # Clean up the temporary file from GCS for privacy, even with lifecycle rule.
        if blob:
            try:
                blob.delete()
            except Exception as e:
                print(f"Error deleting temporary file {gcs_uri}: {e}")