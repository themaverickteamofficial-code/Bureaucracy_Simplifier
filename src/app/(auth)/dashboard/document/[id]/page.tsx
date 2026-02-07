'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useDocumentStore } from '@/store/document-store';
import { PdfPreview } from '@/components/pdf/pdf-preview';
import { ChatPanel } from '@/components/chat/chat-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { simplifyDocument } from '@/ai/flows/simplify-document';
import type { StructuredSummary, ChatMessage } from '@/types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';

export default function DocumentPage() {
  const params = useParams();
  const id = params.id as string;
  const { file } = useDocumentStore();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isSimplifying, setIsSimplifying] = useState(false);
  const [summary, setSummary] = useState<StructuredSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  
  // Determine view mode based on file in store matching the URL ID
  const isNewUploadFlow = useMemo(() => file && encodeURIComponent(file.name) === id, [file, id]);
  const isHistoryView = !isNewUploadFlow;

  const docRef = useMemoFirebase(() => {
    // We only fetch from firestore in history view
    if (!user || !firestore || !isHistoryView) return null;
    return doc(firestore, 'users', user.uid, 'documents', id);
  }, [user, firestore, id, isHistoryView]);

  const { data: historyDoc, isLoading: isHistoryLoading } = useDoc<any>(docRef);

  useEffect(() => {
    if (isNewUploadFlow && file) {
      // New upload flow: read the file from the store
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFileDataUri(reader.result as string);
      };
      reader.onerror = () => {
          setError("Failed to read the document file.");
      };
      // Reset summary when a new file is processed
      setSummary(null);
      setChatHistory([]);
    } else if (isHistoryView && historyDoc) {
      // History view flow: use the loaded document from Firestore
      setSummary(historyDoc.summary);
      setChatHistory([]); // Reset chat history for history view
      setFileDataUri(null); // No file preview for history view
    }
  }, [isNewUploadFlow, isHistoryView, file, historyDoc]);
  
  const handleSimplify = async () => {
    if (!fileDataUri || !file) {
      setError("Document is not ready for simplification.");
      return;
    }

    setIsSimplifying(true);
    setError(null);
    setSummary(null);
    
    try {
      const result = await simplifyDocument({ fileDataUri, language: 'en' });
      setSummary(result);
      setChatHistory([{
        role: 'system',
        content: 'The initial document summary has been provided. The user can now ask follow-up questions.',
        data: result,
      }]);

      if (user && firestore) {
        const saveDocRef = doc(firestore, 'users', user.uid, 'documents', id);
        const docData = {
          id: id,
          userId: user.uid,
          filename: file.name,
          createdAt: serverTimestamp(),
          summary: result,
          storagePath: `users/${user.uid}/documents/${id}` // Placeholder path
        };
        setDocumentNonBlocking(saveDocRef, docData, { merge: true });
      }

    } catch (e) {
      console.error(e);
      setError('An error occurred while simplifying the document. Please try again.');
    } finally {
      setIsSimplifying(false);
    }
  };

  const documentName = useMemo(() => {
      if (isNewUploadFlow && file) return file.name;
      if (isHistoryView && historyDoc) return historyDoc.filename;
      return decodeURIComponent(id);
  }, [isNewUploadFlow, file, isHistoryView, historyDoc, id]);

  const isLoading = isHistoryView && isHistoryLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-10rem)]">
        <div className="md:w-1/2 h-full flex flex-col gap-4">
            <Skeleton className="w-1/2 h-8" />
            <Skeleton className="flex-grow w-full" />
        </div>
        <div className="md:w-1/2 h-full flex flex-col gap-4">
            <Skeleton className="w-1/3 h-8" />
            <Skeleton className="flex-grow w-full" />
        </div>
      </div>
    );
  }
  
  if (error) {
     return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
     )
  }

  if (isHistoryView && !isHistoryLoading && !historyDoc) {
      return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Document Not Found</AlertTitle>
            <AlertDescription>Could not find the document details in your history.</AlertDescription>
        </Alert>
      )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-[calc(100vh-10rem)]">
      <div className="h-full flex flex-col">
        <h1 className="font-headline text-2xl font-semibold mb-4 truncate">{documentName}</h1>
        <PdfPreview fileUrl={fileDataUri} isHistoryView={isHistoryView} />
      </div>
      <div className="h-full flex flex-col">
         <ChatPanel
            onSimplify={handleSimplify}
            isSimplifying={isSimplifying}
            summary={summary}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            fileDataUri={fileDataUri}
            isHistoryView={isHistoryView}
          />
      </div>
    </div>
  );
}
