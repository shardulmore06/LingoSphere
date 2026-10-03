'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Languages,
  ListChecks,
  Users,
  Trophy,
  CreditCard,
  BarChart3,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Stats = {
  users: number;
  languages: number;
  vocabulary: number;
  grammar: number;
  quizzes: number;
  attempts: number;
  achievements: number;
  subscriptions: number;
};

type Profile = {
  name: string | null;
  role: string | null;
};

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [stats, setStats] = useState<Stats>({
    users: 0,
    languages: 0,
    vocabulary: 0,
    grammar: 0,
    quizzes: 0,
    attempts: 0,
    achievements: 0,
    subscriptions: 0,
  });

  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  useEffect(() => {
    async function loadAdminDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: currentProfile, error: profileError } =
        await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', user.id)
          .single();

      if (profileError) {
        console.error(profileError);
        setLoading(false);
        return;
      }

      setProfile(currentProfile);

      if (currentProfile?.role !== 'admin') {
        setLoading(false);
        return;
      }

      const [
        usersResult,
        languagesResult,
        vocabularyResult,
        grammarResult,
        quizzesResult,
        attemptsResult,
        achievementsResult,
        subscriptionsResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('languages')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('vocabulary')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('grammar')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('quiz_questions')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('quiz_attempts')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('achievements')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        users: usersResult.count || 0,
        languages: languagesResult.count || 0,
        vocabulary: vocabularyResult.count || 0,
        grammar: grammarResult.count || 0,
        quizzes: quizzesResult.count || 0,
        attempts: attemptsResult.count || 0,
        achievements: achievementsResult.count || 0,
        subscriptions: subscriptionsResult.count || 0,
      });

      setLoading(false);
    }

    loadAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="mx-auto max-w-lg">
          <CardContent className="p-10 text-center">
            <ShieldAlert className="mx-auto h-14 w-14 text-destructive" />

            <h1 className="mt-5 text-2xl font-bold">
              Access Denied
            </h1>

            <p className="mt-3 text-muted-foreground">
              You do not have permission to access the
              administrator dashboard.
            </p>

            <Button className="mt-6" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Students',
      value: stats.users,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Languages',
      value: stats.languages,
      icon: Languages,
      description: 'Available languages',
    },
    {
      title: 'Vocabulary',
      value: stats.vocabulary,
      icon: BookOpen,
      description: 'Vocabulary entries',
    },
    {
      title: 'Grammar',
      value: stats.grammar,
      icon: GraduationCap,
      description: 'Grammar topics',
    },
    {
      title: 'Quiz Questions',
      value: stats.quizzes,
      icon: ListChecks,
      description: 'Questions available',
    },
    {
      title: 'Quiz Attempts',
      value: stats.attempts,
      icon: BarChart3,
      description: 'Attempts completed',
    },
    {
      title: 'Achievements',
      value: stats.achievements,
      icon: Trophy,
      description: 'Achievement records',
    },
    {
      title: 'Subscriptions',
      value: stats.subscriptions,
      icon: CreditCard,
      description: 'Subscription records',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 lg:py-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              Administrator
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-muted-foreground">
              Welcome back, {profile.name || 'Admin'}.
              Manage LingoSphere from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Student Dashboard
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>

                      <p className="mt-2 text-3xl font-bold">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>

                    <div className="rounded-xl bg-primary/10 p-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold">
            Content Management
          </h2>

          <p className="mt-2 text-muted-foreground">
            Manage the learning content used throughout
            LingoSphere.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <ManagementCard
              title="Languages"
              description="Add and manage learning languages."
              icon={Languages}
              href="/admin/languages"
            />

            <ManagementCard
              title="Vocabulary"
              description="Manage words, meanings and examples."
              icon={BookOpen}
              href="/admin/vocabulary"
            />

            <ManagementCard
              title="Grammar"
              description="Manage grammar lessons and exercises."
              icon={GraduationCap}
              href="/admin/grammar"
            />

            <ManagementCard
              title="Quizzes"
              description="Create and manage quiz questions."
              icon={ListChecks}
              href="/admin/quizzes"
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold">
            Student Management
          </h2>

          <p className="mt-2 text-muted-foreground">
            View students, learning activity and access.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <ManagementCard
              title="Students"
              description="View registered students and their roles."
              icon={Users}
              href="/admin/students"
            />

            <ManagementCard
              title="Subscriptions"
              description="Manage language access and subscriptions."
              icon={CreditCard}
              href="/admin/subscriptions"
            />

            <ManagementCard
              title="Achievements"
              description="Manage achievement content."
              icon={Trophy}
              href="/admin/achievements"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ManagementCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition hover:-translate-y-1 hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>

          <h3 className="mt-5 text-lg font-semibold">
            {title}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>

          <p className="mt-4 text-sm font-medium text-primary">
            Manage →
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}