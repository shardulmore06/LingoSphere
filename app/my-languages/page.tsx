'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Languages,
  Play,
} from 'lucide-react';

import { StudentLayout } from '@/components/student-sidebar';
import { ProgressBar } from '@/components/progress-bar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';

type Language = {
  id: string;
  name: string;
  code: string;
};

type UserLanguage = {
  language_id: string;
};

type ProgressData = {
  language_id: string;
  progress_percentage: number;
  vocabulary_completed: number;
  grammar_completed: number;
  quiz_average: number;
};

export default function MyLanguagesPage() {
  const { profile, loading: authLoading } = useAuth();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    const loadLanguages = async () => {
      setLoading(true);

      const { data: userLanguages, error: userLanguagesError } =
        await supabase
          .from('user_languages')
          .select('language_id')
          .eq('user_id', profile.id);

      if (userLanguagesError) {
        console.error(
          'Error loading user languages:',
          userLanguagesError
        );
        setLoading(false);
        return;
      }

      const languageIds = (userLanguages as UserLanguage[] | null)?.map(
        (item) => item.language_id
      ) ?? [];

      if (languageIds.length === 0) {
        setLanguages([]);
        setProgress([]);
        setLoading(false);
        return;
      }

      const [{ data: languageData, error: languageError }, { data: progressData }] =
        await Promise.all([
          supabase
            .from('languages')
            .select('id, name, code')
            .in('id', languageIds),

          supabase
            .from('progress')
            .select(
              'language_id, progress_percentage, vocabulary_completed, grammar_completed, quiz_average'
            )
            .eq('user_id', profile.id)
            .in('language_id', languageIds),
        ]);

      if (languageError) {
        console.error('Error loading languages:', languageError);
      }

      setLanguages(languageData ?? []);
      setProgress(progressData ?? []);
      setLoading(false);
    };

    loadLanguages();
  }, [profile?.id]);

  if (authLoading || loading) {
    return (
      <StudentLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="animate-pulse text-muted-foreground">
            Loading your languages...
          </p>
        </div>
      </StudentLayout>
    );
  }

  const getProgress = (languageId: string) => {
    return progress.find(
      (item) => item.language_id === languageId
    );
  };

  return (
    <StudentLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <section>
          <p className="text-sm font-medium text-primary">
            Your languages
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            My Languages
          </h1>

          <p className="mt-2 text-muted-foreground">
            Continue learning and track your progress across your
            selected languages.
          </p>
        </section>

        {/* Empty State */}
        {languages.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Languages className="h-8 w-8 text-primary" />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No languages yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                You haven't selected a language yet. Choose a
                language to start your learning journey.
              </p>

              <Button asChild className="mt-6">
                <Link href="/languages">
                  <Languages className="mr-2 h-4 w-4" />
                  Browse Languages
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Language Cards */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {languages.map((language) => {
              const data = getProgress(language.id);

              const percentage = Math.round(
                Number(data?.progress_percentage || 0)
              );

              const isStarted = !!data;

              return (
                <Card
                  key={language.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {language.name}
                        </CardTitle>

                        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                          {language.code}
                        </p>
                      </div>

                      <div className="rounded-lg bg-primary/10 p-3">
                        <Languages className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">

                    {/* Status */}
                    <div className="flex items-center gap-2 text-sm">
                      {isStarted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">
                            Learning in progress
                          </span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">
                            Ready to start
                          </span>
                        </>
                      )}
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">
                          Progress
                        </span>

                        <span className="font-semibold">
                          {percentage}%
                        </span>
                      </div>

                      <ProgressBar value={percentage} />
                    </div>

                    {/* Learning Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-lg font-semibold">
                          {data?.vocabulary_completed || 0}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Vocabulary
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-lg font-semibold">
                          {data?.grammar_completed || 0}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Grammar
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-lg font-semibold">
                          {Math.round(
                            Number(data?.quiz_average || 0)
                          )}%
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Quiz
                        </p>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <Button asChild className="w-full">
                      <Link href={`/languages/${language.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Link>
                    </Button>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </StudentLayout>
  );
}