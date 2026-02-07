import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText, MessageSquare,Languages } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <Button asChild>
          <Link href="/dashboard">Launch App</Link>
        </Button>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            Government Docs,{' '}
            <span className="text-primary">Simplified</span>.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Stop drowning in confusing paperwork. Upload any Indian government document, and our AI will translate it into simple, actionable advice.
          </p>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/dashboard">
              <FileText className="mr-2" />
              Simplify Your First Document
            </Link>
          </Button>
        </section>

        <section className="bg-card/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                Understand, Act, and Move On
              </h2>
              <p className="max-w-xl mx-auto text-muted-foreground mt-2">
                We turn bureaucratic jargon into a clear path forward.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<FileText className="w-8 h-8 text-accent" />}
                title="AI-Powered Summaries"
                description="Get a clear, structured summary: what it means, what to do, and by when."
              />
              <FeatureCard
                icon={<MessageSquare className="w-8 h-8 text-accent" />}
                title="Conversational Chat"
                description="Ask follow-up questions in plain English or Hindi and get instant answers."
              />
              <FeatureCard
                icon={<Languages className="w-8 h-8 text-accent" />}
                title="Multi-Language Support"
                description="Understand everything in your preferred language, starting with Hindi and English."
              />
              <FeatureCard
                icon={<CheckCircle className="w-8 h-8 text-accent" />}
                title="Actionable Steps"
                description="Know exactly what your next steps are, including deadlines and consequences."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Citizen Simplified. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-background border-none shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
      <CardHeader className="items-center">
        <div className="p-4 bg-accent/10 rounded-full">
          {icon}
        </div>
        <CardTitle className="font-headline text-xl mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center">{description}</p>
      </CardContent>
    </Card>
  );
}
