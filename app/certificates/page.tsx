'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  Lock,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Certificate = {
  languageId: string;
  languageName: string;
  progress: number;
  completed: boolean;
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificates() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get languages the student has selected
      const { data: userLanguages, error: userLanguagesError } =
        await supabase
          .from('user_languages')
          .select('language_id')
          .eq('user_id', user.id);

      if (userLanguagesError) {
        console.error(userLanguagesError);
        setLoading(false);
        return;
      }

      if (!userLanguages || userLanguages.length === 0) {
        setCertificates([]);
        setLoading(false);
        return;
      }

      const languageIds = userLanguages.map(
        (item) => item.language_id
      );

      // Get language names
      const { data: languages, error: languagesError } =
        await supabase
          .from('languages')
          .select('id, name')
          .in('id', languageIds);

      if (languagesError) {
        console.error(languagesError);
        setLoading(false);
        return;
      }

      // Get progress
      const { data: progressData, error: progressError } =
        await supabase
          .from('progress')
          .select('language_id, progress_percentage')
          .eq('user_id', user.id)
          .in('language_id', languageIds);

      if (progressError) {
        console.error(progressError);
        setLoading(false);
        return;
      }

      const certificateData: Certificate[] = languageIds.map(
        (languageId) => {
          const language = languages?.find(
            (item) => item.id === languageId
          );

          const progress = progressData?.find(
            (item) => item.language_id === languageId
          );

          const progressPercentage = Math.min(
            100,
            Number(progress?.progress_percentage || 0)
          );

          return {
            languageId,
            languageName: language?.name || 'Language',
            progress: progressPercentage,
            completed: progressPercentage >= 100,
          };
        }
      );

      setCertificates(certificateData);
      setLoading(false);
    }

    loadCertificates();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Loading certificates...
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
          <Award className="h-8 w-8 text-primary" />
        </div>

        <h1 className="mt-6 text-4xl font-bold">
          Certificates
        </h1>

        <p className="mt-4 text-muted-foreground">
          Complete a language to earn your certificate.
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card className="mx-auto mt-12 max-w-2xl">
          <CardContent className="p-10 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />

            <h2 className="mt-5 text-xl font-semibold">
              No certificates yet
            </h2>

            <p className="mt-2 text-muted-foreground">
              Start learning a language to work towards your
              first certificate.
            </p>

            <Button
              asChild
              className="mt-6"
            >
              <Link href="/languages">
                Explore Languages
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {certificates.map((certificate) => (
            <Card
              key={certificate.languageId}
              className={
                certificate.completed
                  ? 'border-primary/40'
                  : 'opacity-80'
              }
            >
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      certificate.completed
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {certificate.completed ? (
                      <Award className="h-7 w-7" />
                    ) : (
                      <Lock className="h-7 w-7" />
                    )}
                  </div>

                  {certificate.completed && (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </div>

                <p className="mt-6 text-sm font-medium text-muted-foreground">
                  LingoSphere Certificate
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {certificate.languageName}
                </h2>

                <p className="mt-2 text-muted-foreground">
                  {certificate.completed
                    ? 'Congratulations! You have completed this language.'
                    : 'Complete 100% of this language to unlock your certificate.'}
                </p>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {certificate.progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${certificate.progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  {certificate.completed ? (
                    <Button className="w-full">
                      <Award className="mr-2 h-4 w-4" />
                      View Certificate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <Link
                        href={`/languages/${certificate.languageId}`}
                      >
                        Continue Learning
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}