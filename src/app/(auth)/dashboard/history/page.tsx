import { DocumentList } from "@/components/document-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="font-headline text-3xl font-bold">Document History</h1>
                <p className="text-muted-foreground">Review your previously analyzed documents and chats.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Documents</CardTitle>
                    <CardDescription>Click on a document to view its summary and chat history.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DocumentList />
                </CardContent>
            </Card>
        </div>
    );
}
