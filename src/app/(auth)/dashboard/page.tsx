import { UploadZone } from "@/components/upload-zone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
             <Card className="w-full max-w-3xl">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Upload Your Document</CardTitle>
                    <CardDescription>Drag & drop your PDF file or click to select a file to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UploadZone />
                </CardContent>
            </Card>
        </div>
    );
}
