'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Lock,
  CheckCircle2,
  Target,
  BookOpen,
  Brain,
  Flame,
  Star,
  Rocket,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get quiz attempts
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('percentage')
        .eq('user_id', user.id);

      // Get progress
      const { data: progressData } = await supabase
        .from('progress')
        .select(
          'progress_percentage, vocabulary_completed, grammar_completed, quiz_average'
        )
        .eq('user_id', user.id);

      const attempts = quizAttempts || [];
      const progress = progressData || [];

      const totalVocabulary = progress.reduce(
        (total, item) =>
          total + Number(item.vocabulary_completed || 0),
        0
      );

      const totalGrammar = progress.reduce(
        (total, item) =>
          total + Number(item.grammar_completed || 0),
        0
      );

      const highestQuizScore =
        attempts.length > 0
          ? Math.max(
              ...attempts.map((attempt) =>
                Number(attempt.percentage || 0)
              )
            )
          : 0;

      const overallProgress =
        progress.length > 0
          ? Math.round(
              progress.reduce(
                (total, item) =>
                  total +
                  Number(item.progress_percentage || 0),
                0
              ) / progress.length
            )
          : 0;

      const calculatedAchievements: Achievement[] = [
        {
          id: 'first-quiz',
          title: 'First Quiz',
          description:
            'Complete your first language quiz.',
          icon: <Target className="h-7 w-7" />,
          unlocked: attempts.length >= 1,
        },
        {
          id: 'vocabulary-learner',
          title: 'Vocabulary Learner',
          description:
            'Learn your first vocabulary word.',
          icon: <BookOpen className="h-7 w-7" />,
          unlocked: totalVocabulary >= 1,
        },
        {
          id: 'grammar-learner',
          title: 'Grammar Learner',
          description:
            'Complete your first grammar topic.',
          icon: <Brain className="h-7 w-7" />,
          unlocked: totalGrammar >= 1,
        },
        {
          id: 'quiz-master',
          title: 'Quiz Master',
          description:
            'Score 100% on a language quiz.',
          icon: <Trophy className="h-7 w-7" />,
          unlocked: highestQuizScore >= 100,
        },
        {
          id: 'halfway-there',
          title: 'Halfway There',
          description:
            'Reach 50% overall language progress.',
          icon: <Star className="h-7 w-7" />,
          unlocked: overallProgress >= 50,
        },
        {
          id: 'language-complete',
          title: 'Language Complete',
          description:
            'Reach 100% progress in a language.',
          icon: <Rocket className="h-7 w-7" />,
          unlocked: progress.some(
            (item) =>
              Number(item.progress_percentage || 0) >= 100
          ),
        },
        {
          id: 'streak',
          title: 'Keep Learning',
          description:
            'Build a consistent learning streak.',
          icon: <Flame className="h-7 w-7" />,
          unlocked: false,
        },
      ];

      setAchievements(calculatedAchievements);
      setLoading(false);
    }

    loadAchievements();
  }, []);

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Loading achievements...
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
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Trophy className="h-8 w-8 text-primary" />
        </div>

        <h1 className="mt-6 text-4xl font-bold">
          Achievements
        </h1>

        <p className="mt-4 text-muted-foreground">
          Complete learning activities and unlock new achievements.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
          {unlockedCount} of {achievements.length} unlocked
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={
              achievement.unlocked
                ? 'border-primary/30'
                : 'opacity-70'
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    achievement.unlocked
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {achievement.icon}
                </div>

                {achievement.unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                {achievement.title}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {achievement.description}
              </p>

              <div className="mt-5">
                {achievement.unlocked ? (
                  <span className="text-sm font-medium text-primary">
                    Achievement unlocked ✓
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Locked
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}