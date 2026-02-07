"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, CornerDownLeft } from "lucide-react";
import { chatWithDocument } from "@/ai/flows/conversational-chat";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@/types";

export function ChatInput({
  chatHistory,
  setChatHistory,
  fileDataUri,
}: {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  fileDataUri: string | null;
}) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { role: "user", content: input };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    if (!fileDataUri) {
      toast({
        title: "Error",
        description: "Document context is missing. Please try reloading.",
        variant: "destructive",
      });
      setChatHistory((prev) => prev.slice(0, -1)); // Remove the user message on error
      setIsLoading(false);
      return;
    }

    try {
      const response = await chatWithDocument({
        message: input,
        history: chatHistory,
        fileDataUri,
      });
      const aiResponse: ChatMessage = {
        role: "assistant",
        content: response.response,
      };
      setChatHistory((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive",
      });
      setChatHistory((prev) => prev.slice(0, -1)); // Remove the user message on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a follow-up question..."
        className="pr-12"
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10"
        disabled={isLoading || !input.trim()}
      >
        {isLoading ? (
          <CornerDownLeft className="h-4 w-4 animate-pulse" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
