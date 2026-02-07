"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/store/document-store";
import { UploadCloud, File as FileIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";

export function UploadZone() {
  const router = useRouter();
  const setFile = useDocumentStore((state) => state.setFile);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type !== "application/pdf") {
          toast({
            title: "Invalid File Type",
            description: "Please upload a PDF document.",
            variant: "destructive",
          });
          return;
        }

        setIsLoading(true);
        setFile(file);

        // Simulate a small delay for better UX before redirecting
        setTimeout(() => {
          router.push(`/dashboard/document/${encodeURIComponent(file.name)}`);
        }, 500);
      }
    },
    [router, setFile, toast]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: {
        "application/pdf": [".pdf"],
      },
    });

  const file = acceptedFiles[0];

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Processing...</p>
            <p className="text-sm text-muted-foreground">Preparing your document for analysis.</p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center text-center">
            <FileIcon className="h-12 w-12 text-primary" />
            <p className="mt-4 text-lg font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <Button variant="link" className="mt-2 text-sm">
              Click or drag to replace
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">
              {isDragActive
                ? "Drop the file here..."
                : "Drag & drop a PDF here"}
            </p>
            <p className="text-sm text-muted-foreground">or</p>
            <Button variant="outline" className="mt-2">
                Select File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
