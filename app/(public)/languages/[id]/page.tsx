'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Brain, Languages } from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Language = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
};

export default function LanguageLearningPage() {
  const params = useParams();
  const languageId = params.id as string;

  const [language, setLanguage] = useState<Language | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLanguage() {
      const { data } = await supabase
        .from('languages')
        .select('*')
        .eq('id', languageId)
        .single();

      setLanguage(data);
      setLoading(false);
    }

    if (languageId) {
      loadLanguage();
    }
  }, [languageId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Loading language...</p>
      </div>
    );
  }

  if (!language) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Language not found</h1>

        <p className="mt-2 text-muted-foreground">
          We couldn't find this language.
        </p>

        <Button asChild className="mt-6">
          <Link href="/languages">Back to Languages</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/languages">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Languages
        </Link>
      </Button>

      <div className="text-center max-w-3xl mx-auto">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Languages className="h-10 w-10 text-primary" />
        </div>

        <h1 className="mt-6 text-4xl font-bold">
          Learn {language.name}
        </h1>

        <p className="mt-4 text-muted-foreground">
          {language.description ||
            `Start building your ${language.name} language skills.`}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-primary" />

            <h2 className="mt-4 text-xl font-semibold">
              Vocabulary
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Learn useful words, meanings, examples and pronunciation.
            </p>

            <Button className="mt-6 w-full" asChild>
              <Link href={`/languages/${language.id}/vocabulary`}>
                Start Vocabulary
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Languages className="mx-auto h-10 w-10 text-primary" />

            <h2 className="mt-4 text-xl font-semibold">
              Grammar
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Understand grammar rules with examples and exercises.
            </p>

            <Button className="mt-6 w-full" asChild>
              <Link href={`/languages/${language.id}/grammar`}>
                Learn Grammar
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="mx-auto h-10 w-10 text-primary" />

            <h2 className="mt-4 text-xl font-semibold">
              Quizzes
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Test your knowledge with interactive quizzes.
            </p>

            <Button className="mt-6 w-full" asChild>
              <Link href={`/languages/${language.id}/quiz`}>
                Take a Quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}