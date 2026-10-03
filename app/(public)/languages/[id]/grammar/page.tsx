'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Languages, CheckCircle, Lock } from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { hasPaidAccess } from '@/lib/course-access';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type GrammarTopic = {
  id: string;
  language_id: string;
  title: string;
  explanation: string;
  examples: string[];
  exercises: {
    q: string;
    a: string;
  }[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

export default function GrammarPage() {
  const params = useParams();
  const languageId = params.id as string;

  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [languageName, setLanguageName] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    async function loadGrammar() {
      const { data: language } = await supabase
        .from('languages')
        .select('name')
        .eq('id', languageId)
        .single();

      const { data: grammar } = await supabase
        .from('grammar')
        .select('*')
        .eq('language_id', languageId)
        .order('created_at');

      const paidAccess = await hasPaidAccess(languageId);

      const allTopics =
        (grammar as GrammarTopic[]) || [];

      const visibleTopics = paidAccess
        ? allTopics
        : allTopics.filter(
            (topic) => topic.difficulty === 'beginner'
          );

      setLanguageName(language?.name || 'Language');
      setTopics(visibleTopics);
      setHasAccess(paidAccess);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: progress } = await supabase
          .from('progress')
          .select('grammar_completed')
          .eq('user_id', user.id)
          .eq('language_id', languageId)
          .maybeSingle();

        if (progress) {
          setCompletedCount(
            Number(progress.grammar_completed || 0)
          );
        }
      }

      setLoading(false);
    }

    if (languageId) {
      loadGrammar();
    }
  }, [languageId]);

  const markGrammarComplete = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data: progress, error: progressError } =
      await supabase
        .from('progress')
        .select(
          'id, vocabulary_completed, grammar_completed, quiz_average'
        )
        .eq('user_id', user.id)
        .eq('language_id', languageId)
        .maybeSingle();

    if (progressError) {
      console.error(progressError);
      return;
    }

    if (!progress) {
      const grammarPercentage =
        topics.length > 0
          ? Math.round((1 / topics.length) * 100)
          : 0;

      const { error } = await supabase
        .from('progress')
        .insert({
          user_id: user.id,
          language_id: languageId,
          progress_percentage: Math.round(
            grammarPercentage / 2
          ),
          lessons_completed: 0,
          vocabulary_completed: 0,
          grammar_completed: 1,
          quiz_average: 0,
        });

      if (error) {
        console.error(error);
        return;
      }

      setCompletedCount(1);
      return;
    }

    const newCount =
      Number(progress.grammar_completed || 0) + 1;

    const safeCount = Math.min(
      newCount,
      topics.length
    );

    const grammarPercentage =
      topics.length > 0
        ? Math.round(
            (safeCount / topics.length) * 100
          )
        : 0;

    const vocabularyCompleted =
      Number(progress.vocabulary_completed || 0);

    const { data: vocabulary } = await supabase
      .from('vocabulary')
      .select('id')
      .eq('language_id', languageId);

    const vocabularyCount = vocabulary?.length || 0;

    const actualVocabularyPercentage =
      vocabularyCount > 0
        ? Math.round(
            (Math.min(
              vocabularyCompleted,
              vocabularyCount
            ) /
              vocabularyCount) *
              100
          )
        : 0;

    const quizAverage =
      Number(progress.quiz_average || 0);

    const overallProgress = Math.round(
      (actualVocabularyPercentage +
        grammarPercentage +
        quizAverage) /
        3
    );

    const { error } = await supabase
      .from('progress')
      .update({
        grammar_completed: safeCount,
        progress_percentage: overallProgress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', progress.id);

    if (error) {
      console.error(error);
      return;
    }

    setCompletedCount(safeCount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Loading grammar...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <Button
        variant="ghost"
        asChild
        className="mb-8"
      >
        <Link href={`/languages/${languageId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {languageName}
        </Link>
      </Button>

      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Languages className="h-8 w-8 text-primary" />
        </div>

        <h1 className="mt-6 text-4xl font-bold">
          {languageName} Grammar
        </h1>

        <p className="mt-4 text-muted-foreground">
          Understand grammar rules through simple explanations,
          examples and exercises.
        </p>

        {topics.length > 0 && (
          <p className="mt-3 text-sm font-medium text-primary">
            {Math.min(completedCount, topics.length)} of{' '}
            {topics.length} free grammar topics completed
          </p>
        )}

        {!hasAccess && (
          <p className="mt-3 text-sm text-muted-foreground">
            A1 beginner grammar is free. Purchase this language
            to unlock intermediate and advanced grammar.
          </p>
        )}
      </div>

      {topics.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-10 text-center">
            <Languages className="mx-auto h-12 w-12 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              No grammar lessons available yet
            </h2>

            <p className="mt-2 text-muted-foreground">
              Grammar content will appear here once it is added.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold">
                    {topic.title}
                  </h2>

                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize">
                    {topic.difficulty}
                  </span>
                </div>

                <p className="mt-5 text-muted-foreground leading-7">
                  {topic.explanation}
                </p>

                {topic.examples?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold">
                      Examples
                    </h3>

                    <div className="mt-3 space-y-2">
                      {topic.examples.map(
                        (example, index) => (
                          <div
                            key={index}
                            className="rounded-lg bg-muted/50 p-3"
                          >
                            {example}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {topic.exercises?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold">
                      Practice Exercises
                    </h3>

                    <div className="mt-3 space-y-3">
                      {topic.exercises.map(
                        (exercise, index) => (
                          <div
                            key={index}
                            className="rounded-lg border p-4"
                          >
                            <p className="font-medium">
                              {exercise.q}
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                              Answer: {exercise.a}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <Button
                  className="mt-6"
                  onClick={markGrammarComplete}
                  disabled={
                    completedCount >= topics.length
                  }
                >
                  <CheckCircle className="mr-2 h-4 w-4" />

                  {completedCount >= topics.length
                    ? 'Completed'
                    : 'Mark Grammar Complete'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!hasAccess && (
        <Card className="max-w-3xl mx-auto mt-10 border-primary/20">
          <CardContent className="p-8 text-center">
            <Lock className="mx-auto h-10 w-10 text-primary" />

            <h2 className="mt-4 text-xl font-semibold">
              Unlock more grammar
            </h2>

            <p className="mt-2 text-muted-foreground">
              Intermediate and advanced grammar is available
              after purchasing this language.
            </p>

            <Button asChild className="mt-6">
              <Link href="/subscriptions">
                View Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}