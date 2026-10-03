
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DifficultyBadge } from '@/components/difficulty-badge';
import { ProgressBar } from '@/components/progress-bar';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { Language } from '@/lib/types';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';

const flagEmojis: Record<string, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
  it: '🇮🇹',
  ja: '🇯🇵',
};

export function LanguageCard({
  language,
  progress,
  href,
  ctaLabel = 'Continue',
}: {
  language: Language;
  progress?: number;
  href: string;
  ctaLabel?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleStartLearning = async () => {
  setLoading(true);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('AUTH ERROR:', authError);
      throw authError;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    console.log('LOGGED IN USER:', user.id);
    console.log('SELECTED LANGUAGE:', language.id);

    const { data: savedLanguage, error: languageError } =
      await supabase
        .from('user_languages')
        .upsert(
          {
            user_id: user.id,
            language_id: language.id,
          },
          {
            onConflict: 'user_id,language_id',
          }
        )
        .select();

    console.log('USER LANGUAGE RESULT:', {
      savedLanguage,
      languageError,
    });

    if (languageError) {
      throw languageError;
    }

    const {
      data: existingProgress,
      error: progressCheckError,
    } = await supabase
      .from('progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('language_id', language.id)
      .maybeSingle();

    console.log('EXISTING PROGRESS:', {
      existingProgress,
      progressCheckError,
    });

    if (progressCheckError) {
      throw progressCheckError;
    }

    if (!existingProgress) {
      const { data: createdProgress, error: progressCreateError } =
        await supabase
          .from('progress')
          .insert({
            user_id: user.id,
            language_id: language.id,
            progress_percentage: 0,
            lessons_completed: 0,
            vocabulary_completed: 0,
            grammar_completed: 0,
            quiz_average: 0,
          })
          .select();

      console.log('PROGRESS RESULT:', {
        createdProgress,
        progressCreateError,
      });

      if (progressCreateError) {
        throw progressCreateError;
      }
    }

    toast({
      title: 'Language selected',
      description: `You are now learning ${language.name}.`,
    });

    router.push(href);
  } catch (error: any) {
    console.error('START LEARNING ERROR:', error);

    toast({
      title: 'Could not save progress',
      description: error?.message || 'Please try again.',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {flagEmojis[language.code] || '🌐'}
            </span>

            <div>
              <h3 className="font-semibold text-lg">
                {language.name}
              </h3>

              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {language.code}
              </p>
            </div>
          </div>

          <DifficultyBadge difficulty={language.difficulty} />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {language.description}
        </p>

        {progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>

              <span>{Math.round(progress)}%</span>
            </div>

            <ProgressBar value={progress} />
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          onClick={handleStartLearning}
          disabled={loading}
        >
          {loading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}

          {loading ? 'Starting...' : ctaLabel}

          {!loading && (
            <ArrowRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

