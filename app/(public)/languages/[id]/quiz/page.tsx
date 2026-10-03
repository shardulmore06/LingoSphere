'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Lock,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { hasPaidAccess } from '@/lib/course-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Question = {
  id: string;
  question: string;
  question_type:
    | 'multiple_choice'
    | 'true_false'
    | 'fill_blank';
  options: string[];
  correct_answer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

export default function QuizPage() {
  const params = useParams();
  const languageId = params.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [languageName, setLanguageName] = useState('');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      const { data: language } = await supabase
        .from('languages')
        .select('name')
        .eq('id', languageId)
        .single();

      const { data: quiz } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('language_id', languageId)
        .order('created_at');

      const paidAccess = await hasPaidAccess(languageId);

      const allQuestions = (quiz as Question[]) || [];

      const visibleQuestions = paidAccess
        ? allQuestions
        : allQuestions.filter(
            (item) => item.difficulty === 'beginner'
          );

      setLanguageName(language?.name || 'Language');
      setQuestions(visibleQuestions);
      setHasAccess(paidAccess);
      setLoading(false);
    }

    if (languageId) {
      loadQuiz();
    }
  }, [languageId]);

  async function saveQuizResult(resultScore: number) {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const percentage = Math.round(
      (resultScore / questions.length) * 100
    );

    const { error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        language_id: languageId,
        score: resultScore,
        total_questions: questions.length,
        percentage,
      });

    if (attemptError) {
      console.error(
        'Error saving quiz result:',
        attemptError
      );
      setSaving(false);
      return;
    }

    const { data: attempts, error: attemptsError } =
      await supabase
        .from('quiz_attempts')
        .select('percentage')
        .eq('user_id', user.id)
        .eq('language_id', languageId);

    if (attemptsError) {
      console.error(
        'Error loading quiz attempts:',
        attemptsError
      );
      setSaving(false);
      return;
    }

    const quizAverage =
      attempts && attempts.length > 0
        ? Math.round(
            attempts.reduce(
              (total, attempt) =>
                total + Number(attempt.percentage || 0),
              0
            ) / attempts.length
          )
        : percentage;

    const { data: progress, error: progressError } =
      await supabase
        .from('progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('language_id', languageId)
        .maybeSingle();

    if (progressError) {
      console.error(
        'Error loading progress:',
        progressError
      );
      setSaving(false);
      return;
    }

    if (!progress) {
      const { error: insertError } = await supabase
        .from('progress')
        .insert({
          user_id: user.id,
          language_id: languageId,
          progress_percentage: quizAverage,
          lessons_completed: 0,
          vocabulary_completed: 0,
          grammar_completed: 0,
          quiz_average: quizAverage,
        });

      if (insertError) {
        console.error(
          'Error creating progress:',
          insertError
        );
      }
    } else {
      const { error: updateError } = await supabase
        .from('progress')
        .update({
          quiz_average: quizAverage,
          progress_percentage: quizAverage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', progress.id);

      if (updateError) {
        console.error(
          'Error updating quiz progress:',
          updateError
        );
      }
    }

    setSaving(false);
  }

  async function handleNext() {
    if (!selected) return;

    const isCorrect =
      selected === questions[current].correct_answer;

    const newScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(newScore);
    }

    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setSelected('');
    } else {
      setFinalScore(newScore);
      setFinished(true);
      await saveQuizResult(newScore);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Loading quiz...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Brain className="mx-auto h-12 w-12 text-muted-foreground" />

        <h1 className="mt-4 text-2xl font-bold">
          No free quiz questions available yet
        </h1>

        <p className="mt-2 text-muted-foreground">
          Beginner A1 quiz questions are free. Intermediate
          and advanced quizzes require course access.
        </p>

        {!hasAccess && (
          <Card className="max-w-md mx-auto mt-8">
            <CardContent className="p-6 text-center">
              <Lock className="mx-auto h-10 w-10 text-primary" />

              <h2 className="mt-4 text-xl font-semibold">
                Unlock More Quizzes
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Purchase this language to unlock intermediate
                and advanced quiz questions.
              </p>

              <Button asChild className="mt-5">
                <Link href="/subscriptions">
                  View Plans
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Button asChild className="mt-6" variant="outline">
          <Link href={`/languages/${languageId}`}>
            Back to {languageName}
          </Link>
        </Button>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round(
      (finalScore / questions.length) * 100
    );

    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-xl mx-auto text-center">
          <CardContent className="p-10">
            <CheckCircle className="mx-auto h-16 w-16 text-primary" />

            <h1 className="mt-6 text-3xl font-bold">
              Quiz Completed!
            </h1>

            <p className="mt-4 text-muted-foreground">
              You completed the {languageName} quiz.
            </p>

            <div className="mt-8 text-5xl font-bold">
              {percentage}%
            </div>

            <p className="mt-3 text-muted-foreground">
              {finalScore} out of {questions.length} correct
            </p>

            {saving && (
              <p className="mt-4 text-sm text-muted-foreground">
                Saving your result...
              </p>
            )}

            {!saving && (
              <p className="mt-4 text-sm text-primary">
                Your result has been saved.
              </p>
            )}

            <div className="mt-8 flex gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard">
                  View Progress
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[current];

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <Button variant="ghost" asChild className="mb-8">
        <Link href={`/languages/${languageId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {languageName}
        </Link>
      </Button>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Brain className="mx-auto h-12 w-12 text-primary" />

          <h1 className="mt-4 text-3xl font-bold">
            {languageName} Quiz
          </h1>

          <p className="mt-2 text-muted-foreground">
            Question {current + 1} of {questions.length}
          </p>

          {!hasAccess && (
            <p className="mt-2 text-sm text-primary">
              Free A1 beginner quiz
            </p>
          )}
        </div>

        <Card>
          <CardContent className="p-6 lg:p-8">
            <h2 className="text-xl font-semibold">
              {question.question}
            </h2>

            <div className="mt-6 space-y-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelected(option)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    selected === option
                      ? 'border-primary bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <Button
              className="mt-8 w-full"
              onClick={handleNext}
              disabled={!selected}
            >
              {current + 1 === questions.length
                ? 'Finish Quiz'
                : 'Next Question'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}