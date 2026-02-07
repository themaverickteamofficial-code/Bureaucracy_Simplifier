'use client';

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthInfo } from "@/hooks/use-auth-info";

export function ChatMessage({ message }: { message: ChatMessageType }) {
    if (message.role === 'system') {
        return null;
    }

    const { initials } = useAuthInfo();

    return (
        <div className={cn(
            "flex items-start gap-3",
            message.role === 'user' ? "justify-end" : "justify-start"
        )}>
            {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "rounded-lg px-4 py-2 max-w-[80%]",
                message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground"
            )}>
                <p className="text-sm">{message.content}</p>
            </div>
            {message.role === 'user' && (
                 <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}