'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Trophy,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { StudentSidebar } from '@/components/student-sidebar';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface QuizAttempt {
  percentage: number;
}

export default function ProfilePage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [quizAttempts, setQuizAttempts] =
    useState(0);

  const [quizAverage, setQuizAverage] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, authLoading]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select(
          'id, name, email, role, created_at'
        )
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error(
          'Error loading profile:',
          profileError
        );
      } else {
        setProfile(profileData as Profile);
      }

      const {
        data: attempts,
        error: quizError,
      } = await supabase
        .from('quiz_attempts')
        .select('percentage')
        .eq('user_id', user.id);

      if (quizError) {
        console.error(
          'Error loading quiz attempts:',
          quizError
        );
      }

      const attemptList =
        (attempts || []) as QuizAttempt[];

      setQuizAttempts(attemptList.length);

      if (attemptList.length > 0) {
        const total = attemptList.reduce(
          (sum, attempt) =>
            sum + Number(attempt.percentage || 0),
          0
        );

        setQuizAverage(
          Math.round(
            total / attemptList.length
          )
        );
      }
    } catch (error) {
      console.error(
        'Profile error:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="text-slate-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <StudentSidebar />

      <main className="ml-64 min-h-screen p-8">

        <button
          onClick={() =>
            router.push('/dashboard')
          }
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            PROFILE
          </p>

          <h1 className="mt-1 text-4xl font-bold">
            My Profile
          </h1>

          <p className="mt-2 text-slate-400">
            View your account information and learning statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Profile card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <User className="h-8 w-8 text-blue-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {profile?.name || 'Learner'}
                </h2>

                <p className="text-slate-400">
                  {profile?.role || 'student'}
                </p>
              </div>
            </div>

            <div className="space-y-4">

              <div className="flex items-center gap-4 rounded-xl bg-slate-800/50 p-4">
                <Mail className="h-5 w-5 text-blue-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Email
                  </p>

                  <p className="mt-1">
                    {profile?.email || user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl bg-slate-800/50 p-4">
                <Shield className="h-5 w-5 text-purple-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Account Role
                  </p>

                  <p className="mt-1 capitalize">
                    {profile?.role || 'student'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl bg-slate-800/50 p-4">
                <Calendar className="h-5 w-5 text-green-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Member Since
                  </p>

                  <p className="mt-1">
                    {profile?.created_at
                      ? new Date(
                          profile.created_at
                        ).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )
                      : 'Not available'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 rounded-xl bg-yellow-500/10 p-3 w-fit">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>

              <p className="text-sm text-slate-400">
                Quiz Attempts
              </p>

              <p className="mt-1 text-3xl font-bold">
                {quizAttempts}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 rounded-xl bg-green-500/10 p-3 w-fit">
                <BookOpen className="h-6 w-6 text-green-400" />
              </div>

              <p className="text-sm text-slate-400">
                Quiz Average
              </p>

              <p className="mt-1 text-3xl font-bold">
                {quizAverage}%
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

