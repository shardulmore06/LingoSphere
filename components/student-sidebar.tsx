'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  LayoutDashboard,
  BookOpen,
  Languages,
  GraduationCap,
  Award,
  Trophy,
  Gamepad2,
  Sparkles,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  ClipboardList,
  Brain,
} from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

const navLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/my-languages',
    label: 'My Languages',
    icon: Languages,
  },
  {
    href: '/lessons',
    label: 'Lessons',
    icon: BookOpen,
  },
  {
    href: '/vocabulary',
    label: 'Vocabulary',
    icon: GraduationCap,
  },
  {
    href: '/grammar',
    label: 'Grammar',
    icon: ClipboardList,
  },
  {
    href: '/quizzes',
    label: 'Quizzes',
    icon: Brain,
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: Award,
  },
  {
    href: '/leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
  },
  {
    href: '/games',
    label: 'Games',
    icon: Gamepad2,
  },
  {
    href: '/achievements',
    label: 'Achievements',
    icon: Award,
  },
  {
    href: '/certificates',
    label: 'Certificates',
    icon: Award,
  },
];

const bottomLinks = [
  {
    href: '/ai-tutor',
    label: 'AI Tutor',
    icon: Sparkles,
  },
  {
    href: '/ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { profile, loading } = useAuth();

  const [open, setOpen] = useState(false);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (loading) return;

    if (profile?.role === 'admin') {
      router.push('/admin');
    }
  }, [profile, loading, router]);

  useEffect(() => {
    if (!profile?.id) return;

    const loadSelectedLanguage = async () => {
      const { data, error } = await supabase
        .from('user_languages')
        .select('language_id')
        .eq('user_id', profile.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading selected language:', error);
        return;
      }

      setSelectedLanguageId(data?.language_id ?? null);
    };

    loadSelectedLanguage();
  }, [profile?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getNavHref = (href: string) => {
    if (!selectedLanguageId) {
      return href;
    }

    if (href === '/lessons') {
      return `/languages/${selectedLanguageId}`;
    }

    if (href === '/vocabulary') {
      return `/languages/${selectedLanguageId}/vocabulary`;
    }

    if (href === '/grammar') {
      return `/languages/${selectedLanguageId}/grammar`;
    }

    if (href === '/quizzes') {
      return `/languages/${selectedLanguageId}/quiz`;
    }

    return href;
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
    const actualHref = getNavHref(href);

    const isActive =
      pathname === actualHref ||
      pathname.startsWith(actualHref + '/');

    return (
      <Link
        href={actualHref}
        onClick={() => setOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
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
        <div className="animate-pulse text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold"
        >
          <Globe className="h-5 w-5 text-primary" />
          LingoSphere
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <button
            onClick={() => setOpen(true)}
            className="p-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-72 bg-background p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold">Menu</span>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => (
                <NavItem
                  key={link.href}
                  {...link}
                />
              ))}

              <div className="pt-4 mt-4 border-t space-y-1">
                {bottomLinks.map((link) => (
                  <NavItem
                    key={link.href}
                    {...link}
                  />
                ))}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center gap-2 border-b px-6 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Globe className="h-4 w-4" />
          </div>

          LingoSphere
        </div>

        <div className="px-3 py-2 border-b">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {profile?.name || 'Student'}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navLinks.map((link) => (
            <NavItem
              key={link.href}
              {...link}
            />
          ))}

          <div className="pt-4 mt-4 border-t space-y-1">
            {bottomLinks.map((link) => (
              <NavItem
                key={link.href}
                {...link}
              />
            ))}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

export function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar />

      <div className="lg:pl-64">
        <div className="hidden lg:flex sticky top-0 z-30 h-14 items-center justify-end gap-2 border-b bg-background/80 backdrop-blur px-6">
          <ThemeToggle />
        </div>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}