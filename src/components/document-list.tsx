'use client';

import { useState } from 'react';
import { FileText, MoreVertical, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDocumentStore } from '@/store/document-store';

// Define the type for the document data fetched from Firestore
type DocumentData = {
  id: string;
  filename: string;
  createdAt: Timestamp; // Firestore timestamp
};

export function DocumentList() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [docToDelete, setDocToDelete] = useState<DocumentData | null>(null);
  const setFile = useDocumentStore((state) => state.setFile);

  const documentsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'documents');
  }, [user, firestore]);

  const { data: documents, isLoading } = useCollection<DocumentData>(documentsQuery);

  const handleDeleteConfirm = () => {
    if (!docToDelete || !user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'documents', docToDelete.id);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Document Deleted',
      description: `"${docToDelete.filename}" has been removed.`,
    });
    setDocToDelete(null);
  };

  const handleView = (docId: string) => {
    setFile(null);
    router.push(`/dashboard/document/${docId}`);
  };
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Loading documents...</span>
        </div>
    );
  }

  if (!documents || documents.length === 0) {
      return (
        <div className="text-center py-10 border border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Documents Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven't simplified any documents yet.
            </p>
        </div>
      );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Simplified</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="truncate max-w-xs">{doc.filename}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {doc.createdAt ? formatDistanceToNow(doc.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50">
                  Complete
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(doc.id)}>View</DropdownMenuItem>
                    <DropdownMenuItem disabled>Export PDF</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground"
                      onClick={() => setDocToDelete(doc)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document summary and analysis for <span className="font-bold">{docToDelete?.filename}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
