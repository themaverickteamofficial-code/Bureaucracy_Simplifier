"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, MessageSquareWarning } from "lucide-react";
import { StructuredSummaryDisplay } from "./structured-output-cards";
import type { StructuredSummary, ChatMessage as ChatMessageType } from "@/types";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

interface ChatPanelProps {
  onSimplify: () => void;
  isSimplifying: boolean;
  summary: StructuredSummary | null;
  chatHistory: ChatMessageType[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
  fileDataUri: string | null;
  isHistoryView?: boolean;
}

export function ChatPanel({
  onSimplify,
  isSimplifying,
  summary,
  chatHistory,
  setChatHistory,
  fileDataUri,
  isHistoryView,
}: ChatPanelProps) {

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border">
      <div className="p-4 border-b">
        <h2 className="font-headline text-2xl font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">Your guide to understanding this document.</p>
      </div>
      
      <ScrollArea className="flex-grow h-0">
        <div className="p-4 space-y-4">
            {!summary && !isSimplifying && !isHistoryView && (
                <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                    <div className="p-4 bg-accent/10 rounded-full mb-4">
                        <Sparkles className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="font-semibold text-lg">Ready to simplify?</h3>
                    <p className="text-muted-foreground mb-4">Click the button to get a plain-language summary.</p>
                    <Button onClick={onSimplify} disabled={isSimplifying} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Simplify for a Citizen
                    </Button>
                </div>
            )}

            {isSimplifying && (
                 <div className="flex items-center justify-center p-8">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                    <span className="text-lg">Analyzing document...</span>
                 </div>
            )}

            {summary && <StructuredSummaryDisplay summary={summary} />}
            
            {isHistoryView && summary && (
                <div className="flex flex-col items-center justify-center text-center p-8 mt-4 rounded-lg bg-muted/50">
                    <MessageSquareWarning className="w-10 h-10 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg">Chat Not Available</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">Follow-up questions are disabled for documents viewed from your history.</p>
                </div>
            )}
            
            <div className="space-y-4">
              {chatHistory.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
            </div>
            <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {summary && !isHistoryView && (
        <div className="border-t p-4 bg-background/50 rounded-b-lg">
            <ChatInput chatHistory={chatHistory} setChatHistory={setChatHistory} fileDataUri={fileDataUri} />
        </div>
      )}
    </div>
  );
}
