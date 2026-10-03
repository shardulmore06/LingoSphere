'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Languages,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Brain,
  Trophy,
  Award,
  LogOut,
  Menu,
  X,
  Globe,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/languages', label: 'Languages', icon: Languages },
  { href: '/admin/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/admin/vocabulary', label: 'Vocabulary', icon: GraduationCap },
  { href: '/admin/grammar', label: 'Grammar', icon: ClipboardList },
  { href: '/admin/quiz-questions', label: 'Quiz Questions', icon: Brain },
  { href: '/admin/quiz-results', label: 'Quiz Results', icon: Trophy },
  { href: '/admin/student-progress', label: 'Student Progress', icon: Award },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login');
    }
    if (!loading && profile && profile.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [profile, loading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const NavItem = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
  }) => {
    const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="lg:hidden sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <Globe className="h-5 w-5 text-primary" />
          Admin
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} className="p-2">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-72 bg-background p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold">Admin Menu</span>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {adminLinks.map((link) => (
                <NavItem key={link.href} {...link} />
              ))}
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Exit to Student
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center gap-2 border-b px-6 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Globe className="h-4 w-4" />
          </div>
          LingoSphere
        </div>

        <div className="px-3 py-2 border-b">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin Panel
          </p>
          <p className="px-3 text-sm font-medium mt-1">{profile?.name || 'Admin'}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {adminLinks.map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
          <div className="pt-4 mt-4 border-t space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              Exit to Student
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="hidden lg:flex sticky top-0 z-30 h-14 items-center justify-end gap-2 border-b bg-background/80 backdrop-blur px-6">
          <ThemeToggle />
        </div>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
