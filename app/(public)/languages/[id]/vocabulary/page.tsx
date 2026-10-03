'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Volume2, BookOpen, Check, Lock, Mic } from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { hasPaidAccess } from '@/lib/course-access';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type VocabularyItem = {
  id: string;
  language_id: string;
  word: string;
  meaning: string;
  example_sentence: string;
  pronunciation: string;
  audio_url: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
};

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

function getSpeechLanguage(languageName: string) {
  const language = languageName.toLowerCase();

  if (language.includes('japanese')) return 'ja-JP';
  if (language.includes('spanish')) return 'es-ES';
  if (language.includes('french')) return 'fr-FR';
  if (language.includes('italian')) return 'it-IT';
  if (language.includes('german')) return 'de-DE';

  return 'en-US';
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"()\-]/g, '');
}

function calculateMatchScore(target: string, spoken: string) {
  const targetText = normalizeText(target);
  const spokenText = normalizeText(spoken);

  if (!targetText || !spokenText) {
    return 0;
  }

  if (targetText === spokenText) {
    return 100;
  }

  if (
    spokenText.includes(targetText) ||
    targetText.includes(spokenText)
  ) {
    return 80;
  }

  const targetLength = targetText.length;
  const spokenLength = spokenText.length;

  const matrix = Array.from(
    { length: targetLength + 1 },
    () => Array(spokenLength + 1).fill(0)
  );

  for (let i = 0; i <= targetLength; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= spokenLength; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= targetLength; i++) {
    for (let j = 1; j <= spokenLength; j++) {
      const cost =
        targetText[i - 1] === spokenText[j - 1]
          ? 0
          : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[targetLength][spokenLength];

  const longestLength = Math.max(
    targetLength,
    spokenLength
  );

  const similarity =
    longestLength === 0
      ? 0
      : 1 - distance / longestLength;

  return Math.max(
    0,
    Math.min(100, Math.round(similarity * 100))
  );
}

export default function VocabularyPage() {
  const params = useParams();
  const languageId = params.id as string;

  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [languageName, setLanguageName] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const [practicingId, setPracticingId] = useState<string | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] =
    useState<Record<string, string>>({});
  const [pronunciationScores, setPronunciationScores] =
    useState<Record<string, number>>({});

  useEffect(() => {
    async function loadVocabulary() {
      const { data: language } = await supabase
        .from('languages')
        .select('name')
        .eq('id', languageId)
        .single();

      const { data: vocabulary } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('language_id', languageId)
        .order('created_at');

      const paidAccess = await hasPaidAccess(languageId);

      const allVocabulary =
        (vocabulary as VocabularyItem[]) || [];

      const visibleVocabulary = paidAccess
        ? allVocabulary
        : allVocabulary.filter(
            (item) => item.difficulty === 'beginner'
          );

      setLanguageName(language?.name || 'Language');
      setItems(visibleVocabulary);
      setHasAccess(paidAccess);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: progress } = await supabase
          .from('progress')
          .select('vocabulary_completed')
          .eq('user_id', user.id)
          .eq('language_id', languageId)
          .maybeSingle();

        if (progress) {
          setCompletedCount(
            Number(progress.vocabulary_completed || 0)
          );
        }
      }

      setLoading(false);
    }

    if (languageId) {
      loadVocabulary();
    }
  }, [languageId]);

  const markVocabularyComplete = async () => {
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
      const vocabularyPercentage =
        items.length > 0
          ? Math.round((1 / items.length) * 100)
          : 0;

      const { error } = await supabase
        .from('progress')
        .insert({
          user_id: user.id,
          language_id: languageId,
          progress_percentage: Math.round(
            vocabularyPercentage / 2
          ),
          lessons_completed: 0,
          vocabulary_completed: 1,
          grammar_completed: 0,
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
      Number(progress.vocabulary_completed || 0) + 1;

    const safeCount = Math.min(
      newCount,
      items.length
    );

    const vocabularyPercentage =
      items.length > 0
        ? Math.round(
            (safeCount / items.length) * 100
          )
        : 0;

    const quizAverage =
      Number(progress.quiz_average || 0);

    const overallProgress = Math.round(
      (vocabularyPercentage + quizAverage) / 2
    );

    const { error } = await supabase
      .from('progress')
      .update({
        vocabulary_completed: safeCount,
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

  const speakWord = (item: VocabularyItem) => {
    if (item.audio_url) {
      const audio = new Audio(item.audio_url);
      audio.play();
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (!('speechSynthesis' in window)) {
      setPronunciationFeedback((prev) => ({
        ...prev,
        [item.id]:
          'Audio is not supported in this browser.',
      }));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      item.word
    );

    utterance.lang = getSpeechLanguage(languageName);
    utterance.rate = 0.8;

    window.speechSynthesis.speak(utterance);
  };

  const practicePronunciation = (item: VocabularyItem) => {
    if (typeof window === 'undefined') {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setPronunciationFeedback((prev) => ({
        ...prev,
        [item.id]:
          'Speech practice is not supported in this browser. Try Chrome.',
      }));
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = getSpeechLanguage(languageName);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setPracticingId(item.id);

    setPronunciationFeedback((prev) => ({
      ...prev,
      [item.id]: 'Listening... say the word now 🎤',
    }));

    recognition.onresult = (event: any) => {
      const spokenText =
        event.results[0][0].transcript;

      const score = calculateMatchScore(
        item.word,
        spokenText
      );

      setPronunciationScores((prev) => ({
        ...prev,
        [item.id]: score,
      }));

      if (score >= 90) {
        setPronunciationFeedback((prev) => ({
          ...prev,
          [item.id]:
            `Excellent! You said "${spokenText}" correctly. 🎉`,
        }));
      } else if (score >= 70) {
        setPronunciationFeedback((prev) => ({
          ...prev,
          [item.id]:
            `Pretty close! You said "${spokenText}". Try it once more.`,
        }));
      } else {
        setPronunciationFeedback((prev) => ({
          ...prev,
          [item.id]:
            `Let's try again. You said "${spokenText}". Listen first, then repeat it.`,
        }));
      }
    };

    recognition.onerror = () => {
      setPronunciationFeedback((prev) => ({
        ...prev,
        [item.id]:
          'I could not hear that clearly. Please try again.',
      }));

      setPracticingId(null);
    };

    recognition.onend = () => {
      setPracticingId(null);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error(error);

      setPracticingId(null);

      setPronunciationFeedback((prev) => ({
        ...prev,
        [item.id]:
          'Could not start the microphone. Please try again.',
      }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Loading vocabulary...
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
          <BookOpen className="h-8 w-8 text-primary" />
        </div>

        <h1 className="mt-6 text-4xl font-bold">
          {languageName} Vocabulary
        </h1>

        <p className="mt-4 text-muted-foreground">
          Learn useful words, meanings, pronunciation and examples.
        </p>

        {items.length > 0 && (
          <p className="mt-3 text-sm font-medium text-primary">
            {Math.min(completedCount, items.length)} of{' '}
            {items.length} free words learned
          </p>
        )}

        {!hasAccess && (
          <p className="mt-3 text-sm text-muted-foreground">
            A1 beginner vocabulary is free. Purchase this language
            to unlock intermediate and advanced vocabulary.
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-10 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              No vocabulary available yet
            </h2>

            <p className="mt-2 text-muted-foreground">
              Vocabulary for this language will appear here once it is added.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {item.word}
                    </h2>

                    <p className="mt-1 text-primary">
                      {item.pronunciation}
                    </p>
                  </div>

                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize">
                    {item.difficulty}
                  </span>
                </div>

                <p className="mt-5 text-lg">
                  {item.meaning}
                </p>

                <div className="mt-5 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Example
                  </p>

                  <p className="mt-1 italic">
                    {item.example_sentence}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => speakWord(item)}
                  >
                    <Volume2 className="mr-2 h-4 w-4" />
                    Listen
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      practicePronunciation(item)
                    }
                    disabled={practicingId === item.id}
                  >
                    <Mic className="mr-2 h-4 w-4" />

                    {practicingId === item.id
                      ? 'Listening...'
                      : 'Practice'}
                  </Button>

                  <Button
                    onClick={markVocabularyComplete}
                    disabled={completedCount >= items.length}
                  >
                    <Check className="mr-2 h-4 w-4" />

                    {completedCount >= items.length
                      ? 'Completed'
                      : 'Mark Learned'}
                  </Button>
                </div>

                {pronunciationFeedback[item.id] && (
                  <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 p-4">
                    <p className="text-sm font-medium">
                      🎤 Pronunciation Practice
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {pronunciationFeedback[item.id]}
                    </p>

                    {pronunciationScores[item.id] !== undefined && (
                      <p className="mt-2 text-lg font-bold text-primary">
                        Match Score: {pronunciationScores[item.id]}%
                      </p>
                    )}
                  </div>
                )}
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
              Unlock more vocabulary
            </h2>

            <p className="mt-2 text-muted-foreground">
              Intermediate and advanced vocabulary is available
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