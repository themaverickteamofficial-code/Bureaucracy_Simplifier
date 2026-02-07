'use client';

import { FileCheck2, FileX2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PdfPreview({ fileUrl, isHistoryView }: { fileUrl: string | null; isHistoryView?: boolean; }) {

  if (!fileUrl && !isHistoryView) {
    return <Skeleton className="w-full h-full" />;
  }
  
  if (isHistoryView) {
    return (
        <Card className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 border-dashed">
            <CardContent className="p-0 flex flex-col items-center justify-center text-center">
                <FileX2 className="w-24 h-24 text-muted-foreground" />
                <p className="mt-4 font-semibold text-lg">PDF Preview Not Available</p>
                <p className="text-muted-foreground">Original file not available for historical documents.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 border-dashed">
        <CardContent className="p-0 flex flex-col items-center justify-center text-center">
            <FileCheck2 className="w-24 h-24 text-green-500" />
            <p className="mt-4 font-semibold text-lg">Document Loaded</p>
            <p className="text-muted-foreground">Ready for simplification.</p>
        </CardContent>
    </Card>
  );
}
