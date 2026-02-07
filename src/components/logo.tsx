import { FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-md">
        <FileText className="h-6 w-6" />
      </div>
      <span className="font-headline text-xl font-bold tracking-tight">
        Citizen Simplified
      </span>
    </Link>
  );
}
