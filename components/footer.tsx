import Link from 'next/link';
import { Globe, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Globe className="h-5 w-5" />
              </div>
              LingoSphere
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Learn languages. Build skills. Explore the world. A modern platform
              for mastering new languages through lessons, vocabulary, grammar,
              and interactive quizzes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/languages" className="hover:text-primary transition-colors">Languages</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Connect</h3>
            <div className="flex gap-3">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LingoSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
