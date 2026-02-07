"use client";

import type { StructuredSummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Target, ListChecks, AlertTriangle, Phone, CheckCircle } from "lucide-react";

type SummaryCardProps = {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
};

function SummaryCard({ icon, title, children }: SummaryCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                {icon}
                <CardTitle className="font-headline text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
                {children}
            </CardContent>
        </Card>
    );
}

export function StructuredSummaryDisplay({ summary }: { summary: StructuredSummary }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1">
                 <AccordionTrigger className="text-lg font-headline">📜 Summary</AccordionTrigger>
                 <AccordionContent className="text-base text-muted-foreground pt-2">
                    {summary.summary}
                 </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                 <AccordionTrigger className="text-lg font-headline">🎯 What This Means For You</AccordionTrigger>
                 <AccordionContent className="text-base text-muted-foreground pt-2">
                    {summary.whatItMeans}
                 </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                 <AccordionTrigger className="text-lg font-headline">✅ Action Steps</AccordionTrigger>
                 <AccordionContent className="pt-2">
                     <ul className="space-y-3">
                        {summary.actions.map((action, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <div>
                                    <span>{action.step}</span>
                                    {action.deadline && (
                                        <p className="text-sm text-amber-500 font-medium">
                                            Deadline: {action.deadline}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                 </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                 <AccordionTrigger className="text-lg font-headline">⚠️ Consequences of Ignoring</AccordionTrigger>
                 <AccordionContent className="text-base text-muted-foreground pt-2">
                    {summary.consequences}
                 </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                 <AccordionTrigger className="text-lg font-headline">📞 Helplines & Next Steps</AccordionTrigger>
                 <AccordionContent className="pt-2">
                     <ul className="space-y-2">
                        {summary.helplines.map((helpline, index) => (
                             <li key={index} className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="w-4 h-4 text-primary flex-shrink-0"/>
                                <span>{helpline}</span>
                            </li>
                        ))}
                     </ul>
                 </AccordionContent>
            </AccordionItem>
        </Accordion>

        <div className="text-xs text-muted-foreground/80 italic text-center pt-4">
            {summary.disclaimer}
        </div>
    </div>
  );
}
