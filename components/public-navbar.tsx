'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const publicNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/features', label: 'Features' },
  { href: '/languages', label: 'Languages' },
];

export function PublicNavbar() {
  const pathname = usePathnamesafe();
  const [open, setOpen] = useState(false);
  const { user, profile, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Globe className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">LingoSphere</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {publicNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {!loading && !user && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Start Learning</Link>
              </Button>
            </>
          )}
          {!loading && user && (
            <Button asChild>
              <Link href={profile?.role === 'admin' ? '/admin' : '/dashboard'}>
                Dashboard
              </Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium',
                  pathname === link.href
                    ? 'text-primary bg-muted'
                    : 'text-muted-foreground'
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t">
              <ThemeToggle />
              {!loading && !user && (
                <>
                  <Button variant="ghost" asChild className="flex-1">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/register">Start Learning</Link>
                  </Button>
                </>
              )}
              {!loading && user && (
                <Button asChild className="w-full">
                  <Link href={profile?.role === 'admin' ? '/admin' : '/dashboard'}>
                    Dashboard
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function usePathnamesafe() {
  return usePathname();
}
