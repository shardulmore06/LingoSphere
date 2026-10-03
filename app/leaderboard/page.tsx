'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Medal,
  ArrowLeft,
  User,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { StudentSidebar } from '@/components/student-sidebar';

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface QuizAttempt {
  user_id: string;
  percentage: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  average: number;
  attempts: number;
}

export default function LeaderboardPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<
    LeaderboardUser[]
  >([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadLeaderboard();
    }
  }, [user, authLoading]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      const {
        data: profiles,
        error: profilesError,
      } = await supabase
        .from('profiles')
        .select('id, name, email');

      if (profilesError) {
        console.error(
          'Error loading profiles:',
          profilesError
        );
        return;
      }

      const {
        data: attempts,
        error: attemptsError,
      } = await supabase
        .from('quiz_attempts')
        .select('user_id, percentage');

      if (attemptsError) {
        console.error(
          'Error loading quiz attempts:',
          attemptsError
        );
        return;
      }

      const profileList =
        (profiles || []) as Profile[];

      const attemptList =
        (attempts || []) as QuizAttempt[];

      const leaderboardData: LeaderboardUser[] =
        profileList
          .map((profile) => {
            const userAttempts =
              attemptList.filter(
                (attempt) =>
                  attempt.user_id === profile.id
              );

            if (userAttempts.length === 0) {
              return null;
            }

            const total = userAttempts.reduce(
              (sum, attempt) =>
                sum + Number(attempt.percentage || 0),
              0
            );

            const average = Math.round(
              total / userAttempts.length
            );

            return {
              id: profile.id,
              name: profile.name || 'Learner',
              average,
              attempts: userAttempts.length,
            };
          })
          .filter(
            (
              item
            ): item is LeaderboardUser =>
              item !== null
          )
          .sort(
            (a, b) =>
              b.average - a.average
          );

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error(
        'Leaderboard error:',
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
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  const currentUserIndex =
    leaderboard.findIndex(
      (item) => item.id === user?.id
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <StudentSidebar />

      <main className="ml-64 min-h-screen p-8">

        <div className="mb-8">
          <button
            onClick={() =>
              router.push('/dashboard')
            }
            className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-yellow-500/10 p-4">
              <Trophy className="h-8 w-8 text-yellow-400" />
            </div>

            <div>
              <p className="text-sm font-medium text-yellow-400">
                LEADERBOARD
              </p>

              <h1 className="mt-1 text-4xl font-bold">
                Top Learners
              </h1>

              <p className="mt-2 text-slate-400">
                See how your quiz performance compares.
              </p>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-slate-600" />

            <h2 className="text-xl font-semibold">
              No leaderboard data yet
            </h2>

            <p className="mt-2 text-slate-400">
              Complete a quiz to appear on the leaderboard.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 px-6 py-5">
              <h2 className="text-xl font-semibold">
                Rankings
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Ranked by average quiz score.
              </p>
            </div>

            <div className="divide-y divide-slate-800">

              {leaderboard.map(
                (item, index) => {
                  const rank = index + 1;

                  const isCurrentUser =
                    item.id === user?.id;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-6 py-5 transition ${
                        isCurrentUser
                          ? 'bg-blue-500/10'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >

                      <div className="flex items-center gap-5">

                        <div className="flex h-10 w-10 items-center justify-center">
                          {rank === 1 ? (
                            <Medal className="h-7 w-7 text-yellow-400" />
                          ) : rank === 2 ? (
                            <Medal className="h-7 w-7 text-slate-300" />
                          ) : rank === 3 ? (
                            <Medal className="h-7 w-7 text-orange-400" />
                          ) : (
                            <span className="text-lg font-bold text-slate-500">
                              #{rank}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">
                                {item.name}
                              </p>

                              {isCurrentUser && (
                                <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-slate-500">
                              {item.attempts}{' '}
                              {item.attempts === 1
                                ? 'quiz attempt'
                                : 'quiz attempts'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">
                          {item.average}%
                        </p>

                        <p className="text-xs text-slate-500">
                          Average Score
                        </p>
                      </div>

                    </div>
                  );
                }
              )}

            </div>
          </div>
        )}

        {currentUserIndex >= 0 && (
          <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
            <p className="text-sm text-slate-400">
              Your current position
            </p>

            <p className="mt-1 text-2xl font-bold">
              #{currentUserIndex + 1}
            </p>
          </div>
        )}

      </main>
    </div>
  );
}