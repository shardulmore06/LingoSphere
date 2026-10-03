'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Brain,
  Languages,
  Target,
} from 'lucide-react';

import { StudentLayout } from '@/components/student-sidebar';
import { ProgressBar } from '@/components/progress-bar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';

type Language = {
  id: string;
  name: string;
  code: string;
};

type ProgressData = {
  language_id: string;
  progress_percentage: number;
  vocabulary_completed: number;
  grammar_completed: number;
  quiz_average: number;
};

export default function ProgressPage() {
  const { profile, loading: authLoading } = useAuth();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [vocabularyCounts, setVocabularyCounts] = useState<
    Record<string, number>
  >({});
  const [grammarCounts, setGrammarCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    const loadProgress = async () => {
      setLoading(true);

      const { data: userLanguages, error: userLanguagesError } =
        await supabase
          .from('user_languages')
          .select('language_id')
          .eq('user_id', profile.id);

      if (userLanguagesError) {
        console.error(userLanguagesError);
        setLoading(false);
        return;
      }

      const languageIds = (userLanguages ?? []).map(
        (item) => item.language_id
      );

      if (languageIds.length === 0) {
        setLanguages([]);
        setProgress([]);
        setLoading(false);
        return;
      }

      const [
        { data: languageData },
        { data: progressData },
        { data: vocabularyData },
        { data: grammarData },
      ] = await Promise.all([
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

        supabase
          .from('vocabulary')
          .select('language_id')
          .in('language_id', languageIds),

        supabase
          .from('grammar')
          .select('language_id')
          .in('language_id', languageIds),
      ]);

      const vocabCountMap: Record<string, number> = {};
      const grammarCountMap: Record<string, number> = {};

      (vocabularyData ?? []).forEach((item) => {
        vocabCountMap[item.language_id] =
          (vocabCountMap[item.language_id] || 0) + 1;
      });

      (grammarData ?? []).forEach((item) => {
        grammarCountMap[item.language_id] =
          (grammarCountMap[item.language_id] || 0) + 1;
      });

      setLanguages(languageData ?? []);
      setProgress(progressData ?? []);
      setVocabularyCounts(vocabCountMap);
      setGrammarCounts(grammarCountMap);
      setLoading(false);
    };

    loadProgress();
  }, [profile?.id]);

  if (authLoading || loading) {
    return (
      <StudentLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="animate-pulse text-muted-foreground">
            Loading your progress...
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

  const getVocabularyPercentage = (languageId: string) => {
    const data = getProgress(languageId);
    const total = vocabularyCounts[languageId] || 0;

    if (total === 0) return 0;

    return Math.min(
      100,
      Math.round(
        ((data?.vocabulary_completed || 0) / total) * 100
      )
    );
  };

  const getGrammarPercentage = (languageId: string) => {
    const data = getProgress(languageId);
    const total = grammarCounts[languageId] || 0;

    if (total === 0) return 0;

    return Math.min(
      100,
      Math.round(
        ((data?.grammar_completed || 0) / total) * 100
      )
    );
  };

  const overallProgress =
    progress.length > 0
      ? Math.round(
          progress.reduce(
            (sum, item) =>
              sum + Number(item.progress_percentage || 0),
            0
          ) / progress.length
        )
      : 0;

  const overallQuizAverage =
    progress.length > 0
      ? Math.round(
          progress.reduce(
            (sum, item) =>
              sum + Number(item.quiz_average || 0),
            0
          ) / progress.length
        )
      : 0;

  return (
    <StudentLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <section>
          <p className="text-sm font-medium text-primary">
            Your learning journey
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Progress
          </h1>

          <p className="mt-2 text-muted-foreground">
            Track your learning progress across all your languages.
          </p>
        </section>

        {/* Overall Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Overall Progress
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {overallProgress}%
                  </p>
                </div>

                <div className="rounded-lg bg-primary/10 p-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Languages
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {languages.length}
                  </p>
                </div>

                <div className="rounded-lg bg-primary/10 p-3">
                  <Languages className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Quiz Average
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {overallQuizAverage}%
                  </p>
                </div>

                <div className="rounded-lg bg-primary/10 p-3">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Languages Started
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {progress.length}
                  </p>
                </div>

                <div className="rounded-lg bg-primary/10 p-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

        </section>

        {/* Language Progress */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Language Progress
            </h2>

            <p className="text-sm text-muted-foreground">
              Detailed progress for each language you're learning.
            </p>
          </div>

          {languages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Languages className="mb-4 h-10 w-10 text-muted-foreground" />

                <h3 className="font-semibold">
                  No languages selected yet
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a language to start tracking your progress.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {languages.map((language) => {
                const data = getProgress(language.id);

                const totalProgress = Math.round(
                  Number(data?.progress_percentage || 0)
                );

                const vocabularyPercentage =
                  getVocabularyPercentage(language.id);

                const grammarPercentage =
                  getGrammarPercentage(language.id);

                const quizAverage = Math.round(
                  Number(data?.quiz_average || 0)
                );

                return (
                  <Card key={language.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>
                            {language.name}
                          </CardTitle>

                          <p className="mt-1 text-sm uppercase text-muted-foreground">
                            {language.code}
                          </p>
                        </div>

                        <span className="text-2xl font-bold">
                          {totalProgress}%
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">

                      {/* Overall */}
                      <div>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium">
                            Overall Progress
                          </span>

                          <span>
                            {totalProgress}%
                          </span>
                        </div>

                        <ProgressBar value={totalProgress} />
                      </div>

                      {/* Vocabulary */}
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />

                            <span>
                              Vocabulary
                            </span>
                          </div>

                          <span>
                            {vocabularyPercentage}%
                          </span>
                        </div>

                        <ProgressBar
                          value={vocabularyPercentage}
                        />
                      </div>

                      {/* Grammar */}
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />

                            <span>
                              Grammar
                            </span>
                          </div>

                          <span>
                            {grammarPercentage}%
                          </span>
                        </div>

                        <ProgressBar
                          value={grammarPercentage}
                        />
                      </div>

                      {/* Quiz */}
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />

                            <span>
                              Quiz Average
                            </span>
                          </div>

                          <span>
                            {quizAverage}%
                          </span>
                        </div>

                        <ProgressBar value={quizAverage} />
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </StudentLayout>
  );
}