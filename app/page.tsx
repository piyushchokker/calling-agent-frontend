import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PhoneCall, Zap, BarChart3, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <PhoneCall className="w-4 h-4 text-background" />
          </div>
          <span className="text-xl font-bold tracking-tight">Agentic Voice</span>
        </div>
        <nav>
          <Link href="/login">
            <Button variant="secondary" className="font-medium">Sign In</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
          The Future of <span className="text-muted-foreground">AI Lead Management</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Automate your calls, qualify leads instantly, and close deals faster with our advanced multi-tenant voice orchestrator.
        </p>
        <Link href="/login">
          <Button size="lg" className="h-12 px-8 text-base font-semibold">
            Access Dashboard
          </Button>
        </Link>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Instant Outreach</h3>
            <p className="text-muted-foreground">Initiate calls the moment a lead enters the system, minimizing response times and maximizing conversion.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Real-time Analytics</h3>
            <p className="text-muted-foreground">Monitor campaign performance, call outcomes, and lead qualification rates from a central dashboard.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Secure & Multi-tenant</h3>
            <p className="text-muted-foreground">Built for scale. Manage multiple clients securely within completely isolated tenant environments.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>&copy; {new Date().getFullYear()} Agentic Voice. All rights reserved.</p>
      </footer>
    </div>
  );
}
