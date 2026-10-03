'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Brain,
  Trophy,
  Flame,
  Target,
  ChevronRight,
  Languages,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { StudentSidebar } from '@/components/student-sidebar';

interface Language {
  id: string;
  name: string;
  code: string;
}

interface UserLanguage {
  language_id: string;
}

interface Progress {
  id: string;
  user_id: string;
  language_id: string;
  lessons_completed: number;
  vocabulary_completed: number;
  grammar_completed: number;
  quiz_average: number;
  progress_percentage: number;
  updated_at: string;
}

interface QuizAttempt {
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
}

interface DashboardProgress extends Progress {
  language_name: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [progress, setProgress] = useState<DashboardProgress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadDashboard();
    }
  }, [user, authLoading]);

  const loadDashboard = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // --------------------------------------------------
      // 1. Get languages the user is learning
      // --------------------------------------------------

      const {
        data: userLanguages,
        error: userLanguagesError,
      } = await supabase
        .from('user_languages')
        .select('language_id')
        .eq('user_id', user.id);

      if (userLanguagesError) {
        console.error(
          'Error loading user languages:',
          userLanguagesError
        );
      }

      const userLanguageList =
        (userLanguages || []) as UserLanguage[];

      setLanguages(userLanguageList);

      // --------------------------------------------------
      // 2. Get language information
      // --------------------------------------------------

      const languageIds = userLanguageList.map(
        (item) => item.language_id
      );

      let languageList: Language[] = [];

      if (languageIds.length > 0) {
        const {
          data: languageData,
          error: languageError,
        } = await supabase
          .from('languages')
          .select('id, name, code')
          .in('id', languageIds);

        if (languageError) {
          console.error(
            'Error loading languages:',
            languageError
          );
        }

        languageList =
          (languageData || []) as Language[];
      }

      // --------------------------------------------------
      // 3. Get saved progress
      // --------------------------------------------------

      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) {
        console.error(
          'Error loading progress:',
          progressError
        );
      }

      const savedProgress =
        (progressData || []) as Progress[];

      // --------------------------------------------------
      // 4. Match languages with progress
      // --------------------------------------------------

      const dashboardProgress: DashboardProgress[] = [];

      for (const userLanguage of userLanguageList) {
        const language = languageList.find(
          (item) =>
            item.id === userLanguage.language_id
        );

        if (!language) {
          continue;
        }

        const currentProgress = savedProgress.find(
          (item) =>
            item.language_id ===
            userLanguage.language_id
        );

        if (currentProgress) {
          dashboardProgress.push({
            ...currentProgress,
            language_name: language.name,
          });
        } else {
          dashboardProgress.push({
            id: '',
            user_id: user.id,
            language_id: language.id,
            lessons_completed: 0,
            vocabulary_completed: 0,
            grammar_completed: 0,
            quiz_average: 0,
            progress_percentage: 0,
            updated_at: '',
            language_name: language.name,
          });
        }
      }

      setProgress(dashboardProgress);

      // --------------------------------------------------
      // 5. Get quiz attempts
      // --------------------------------------------------

      const {
        data: attempts,
        error: quizError,
      } = await supabase
        .from('quiz_attempts')
       .select('score, total_questions, percentage, completed_at')
        .eq('user_id', user.id);

      if (quizError) {
        console.error(
          'Error loading quiz attempts:',
          quizError
        );
      }

      setQuizAttempts(
        (attempts || []) as QuizAttempt[]
      );
    } catch (error) {
      console.error(
        'Dashboard error:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Overall progress
  // --------------------------------------------------

  const overallProgress =
    progress.length > 0
      ? Math.round(
          progress.reduce(
            (total, item) =>
              total +
              Number(
                item.progress_percentage || 0
              ),
            0
          ) / progress.length
        )
      : 0;

  // --------------------------------------------------
  // Overall quiz average
  // --------------------------------------------------

  const overallQuizAverage =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce(
            (total, attempt) =>
              total +
              Number(
                attempt.percentage || 0
              ),
            0
          ) / quizAttempts.length
        )
      : 0;
      const activityDates = new Set(
  quizAttempts
    .filter((attempt) => attempt.completed_at)
    .map((attempt) =>
      new Date(attempt.completed_at)
        .toLocaleDateString('en-CA')
    )
);

let learningStreak = 0;

const today = new Date();

for (let i = 0; ; i++) {
  const date = new Date(today);

  date.setDate(today.getDate() - i);

  const dateString = date.toLocaleDateString('en-CA');

  if (activityDates.has(dateString)) {
    learningStreak++;
  } else {
    break;
  }
}

  // --------------------------------------------------
  // User name
  // --------------------------------------------------

  const firstName =
    profile?.name || 'Learner';

  // --------------------------------------------------
  // Dashboard
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <StudentSidebar />

      <main className="ml-64 min-h-screen p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            STUDENT DASHBOARD
          </p>

          <h1 className="text-4xl font-bold">
            Welcome back, {firstName}! 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Keep learning and build your language skills.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 rounded-xl bg-blue-500/10 p-3 w-fit">
              <Target className="h-6 w-6 text-blue-400" />
            </div>

            <p className="text-sm text-slate-400">
              Overall Progress
            </p>

            <p className="mt-1 text-3xl font-bold">
              {overallProgress}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 rounded-xl bg-purple-500/10 p-3 w-fit">
              <Languages className="h-6 w-6 text-purple-400" />
            </div>

            <p className="text-sm text-slate-400">
              Languages
            </p>

            <p className="mt-1 text-3xl font-bold">
              {languages.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 rounded-xl bg-green-500/10 p-3 w-fit">
              <Brain className="h-6 w-6 text-green-400" />
            </div>

            <p className="text-sm text-slate-400">
              Quiz Average
            </p>

            <p className="mt-1 text-3xl font-bold">
              {overallQuizAverage}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 rounded-xl bg-orange-500/10 p-3 w-fit">
              <Flame className="h-6 w-6 text-orange-400" />
            </div>

            <p className="text-sm text-slate-400">
              Learning Streak
            </p>

            <p className="mt-1 text-3xl font-bold">
              {learningStreak} days
            </p>
          </div>

        </div>

        {/* Languages */}
        <div className="mb-8">

          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Your Languages
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Continue where you left off.
            </p>
          </div>

          {progress.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

              <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-600" />

              <h3 className="text-lg font-semibold">
                No languages yet
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Start learning a language to see your progress here.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              {progress.map((item) => (
                <div
                  key={item.language_id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                >

                  <div className="mb-5 flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <div className="rounded-xl bg-blue-500/10 p-3">
                        <BookOpen className="h-6 w-6 text-blue-400" />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.language_name}
                        </h3>

                        <p className="text-sm text-slate-400">
                          Your learning progress
                        </p>
                      </div>

                    </div>

                    <span className="text-2xl font-bold text-blue-400">
                      {Number(
                        item.progress_percentage || 0
                      )}
                      %
                    </span>

                  </div>

                  <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${Number(
                          item.progress_percentage || 0
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">

                    <div className="rounded-xl bg-slate-800/60 p-3">
                      <p className="text-xs text-slate-500">
                        Vocabulary
                      </p>

                      <p className="mt-1 font-semibold">
                        {item.vocabulary_completed}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-800/60 p-3">
                      <p className="text-xs text-slate-500">
                        Grammar
                      </p>

                      <p className="mt-1 font-semibold">
                        {item.grammar_completed}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-800/60 p-3">
                      <p className="text-xs text-slate-500">
                        Quiz
                      </p>

                      <p className="mt-1 font-semibold">
                        {Number(
                          item.quiz_average || 0
                        )}
                        %
                      </p>
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/languages/${item.language_id}`
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500"
                  >
                    Continue Learning
                    <ChevronRight className="h-4 w-4" />
                  </button>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* Quick Actions */}
        <div>

          <h2 className="mb-5 text-2xl font-bold">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <button
              onClick={() =>
                router.push('/languages')
              }
              className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-blue-500/50"
            >
              <BookOpen className="h-6 w-6 text-blue-400" />

              <div>
                <p className="font-semibold">
                  Learn
                </p>

                <p className="text-sm text-slate-400">
                  Explore lessons
                </p>
              </div>
            </button>

            <button
              onClick={() =>
                router.push('/languages')
              }
              className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-purple-500/50"
            >
              <Brain className="h-6 w-6 text-purple-400" />

              <div>
                <p className="font-semibold">
                  Practice
                </p>

                <p className="text-sm text-slate-400">
                  Practice vocabulary and grammar
                </p>
              </div>
            </button>

            <button
              onClick={() =>
                router.push('/leaderboard')
              }
              className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-yellow-500/50"
            >
              <Trophy className="h-6 w-6 text-yellow-400" />

              <div>
                <p className="font-semibold">
                  Leaderboard
                </p>

                <p className="text-sm text-slate-400">
                  Check your ranking
                </p>
              </div>
            </button>

          </div>

        </div>

      </main>
    </div>
  );
}