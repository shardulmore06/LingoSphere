'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { LanguageCard } from '@/components/language-card';
import { LoadingState, EmptyState } from '@/components/state-components';
import type { Language } from '@/lib/types';

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLanguages = async () => {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading languages:', error);
      }

      setLanguages((data as Language[]) || []);
      setLoading(false);
    };

    loadLanguages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm font-medium text-muted-foreground mb-4">
          <Globe className="h-4 w-4 text-primary" />
          Available Languages
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold">
          Choose a language to learn
        </h1>

        <p className="mt-4 text-muted-foreground">
          Select from our supported languages and start your learning journey today.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading languages..." />
      ) : languages.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-12 w-12" />}
          title="No languages available yet"
          description="Please check back soon for available languages."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang) => (
            <LanguageCard
              key={lang.id}
              language={lang}
              href={`/languages/${lang.id}`}
              ctaLabel="Start Learning"
            />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Button size="lg" asChild>
          <Link href="/register">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}