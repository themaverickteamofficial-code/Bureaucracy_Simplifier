# Citizen Simplified

**Citizen Simplified** is an AI-powered web application that helps ordinary citizens (primarily in India) understand and act on complex government notices and official documents by converting them into simple, plain-language guidance.

This project is a Next.js application generated with Firebase Studio.

## Core Features

-   **PDF Upload and Preview**: Users can upload PDF government documents.
-   **AI Document Simplification**: The app provides a one-click "Simplify for a Citizen" feature that generates a structured, easy-to-read summary with key sections.
-   **Conversational Chat**: A full conversational chat interface allows users to ask follow-up questions (e.g., "What if I miss the deadline?", "Explain in Hindi").
-   **Multi-Language Support**: The application supports Hindi and English on demand.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Next, set up your environment variables. Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

You will need to add your Google AI API key to the `.env` file to enable the AI features.

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.