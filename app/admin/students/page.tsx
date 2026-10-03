'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  Calendar,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Student = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
  languages: string[];
  progress: number;
  quizAverage: number;
  quizAttempts: number;
};

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
};

type UserLanguage = {
  user_id: string;
  language_id: string;
};

type Language = {
  id: string;
  name: string;
};

type Progress = {
  user_id: string;
  language_id: string;
  progress_percentage: number | null;
};

type QuizAttempt = {
  user_id: string;
  percentage: number | null;
};

export default function AdminStudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email, role, created_at')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      setLoading(false);
      return;
    }

    const [
      profilesResult,
      userLanguagesResult,
      languagesResult,
      progressResult,
      quizAttemptsResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, email, role, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false }),

      supabase
        .from('user_languages')
        .select('user_id, language_id'),

      supabase
        .from('languages')
        .select('id, name'),

      supabase
        .from('progress')
        .select('user_id, language_id, progress_percentage'),

      supabase
        .from('quiz_attempts')
        .select('user_id, percentage'),
    ]);

    if (profilesResult.error) {
      console.error(profilesResult.error);
      setLoading(false);
      return;
    }

    const profiles = (profilesResult.data || []) as Profile[];
    const userLanguages =
      (userLanguagesResult.data || []) as UserLanguage[];
    const languages =
      (languagesResult.data || []) as Language[];
    const progress =
      (progressResult.data || []) as Progress[];
    const quizAttempts =
      (quizAttemptsResult.data || []) as QuizAttempt[];

    const languageMap = new Map<string, string>();

    languages.forEach((language) => {
      languageMap.set(language.id, language.name);
    });

    const studentsData: Student[] = profiles.map((profile) => {
      const studentLanguages = userLanguages
        .filter((item) => item.user_id === profile.id)
        .map((item) => languageMap.get(item.language_id))
        .filter(Boolean) as string[];

      const studentProgress = progress.filter(
        (item) => item.user_id === profile.id
      );

      const progressAverage =
        studentProgress.length > 0
          ? Math.round(
              studentProgress.reduce(
                (sum, item) =>
                  sum +
                  Number(item.progress_percentage || 0),
                0
              ) / studentProgress.length
            )
          : 0;

      const studentAttempts = quizAttempts.filter(
        (item) => item.user_id === profile.id
      );

      const quizAverage =
        studentAttempts.length > 0
          ? Math.round(
              studentAttempts.reduce(
                (sum, item) =>
                  sum + Number(item.percentage || 0),
                0
              ) / studentAttempts.length
            )
          : 0;

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        created_at: profile.created_at,
        languages: studentLanguages,
        progress: progressAverage,
        quizAverage,
        quizAttempts: studentAttempts.length,
      };
    });

    setStudents(studentsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">
          Loading students...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="mb-3 -ml-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>

            <h1 className="text-3xl font-bold text-slate-900">
              Student Management
            </h1>

            <p className="text-slate-600 mt-1">
              View students, learning activity and performance.
            </p>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Users className="w-5 h-5" />
            <span className="font-semibold">
              {students.length} Students
            </span>
          </div>
        </div>

        {/* Empty State */}
        {students.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />

              <h2 className="text-xl font-semibold text-slate-900">
                No students found
              </h2>

              <p className="text-slate-500 mt-2">
                Student accounts will appear here once they register.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {students.map((student) => (
              <Card
                key={student.id}
                className="bg-white border border-slate-200"
              >
                <CardContent className="p-6">

                  {/* Student Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                    <div className="bg-white">
                      <h2 className="text-xl font-bold text-slate-900">
                        {student.name || 'Unnamed Student'}
                      </h2>

                      <p className="text-sm text-slate-600 mt-1">
                        {student.email || 'No email available'}
                      </p>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium w-fit">
                      {student.role || 'student'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Languages */}
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">
                          Languages
                        </span>
                      </div>

                      {student.languages.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {student.languages.map((language) => (
                            <span
                              key={language}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 text-sm text-slate-700"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="font-semibold text-slate-900">
                          None
                        </p>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">
                          Overall Progress
                        </span>
                      </div>

                      <p className="text-2xl font-bold text-slate-900">
                        {student.progress}%
                      </p>

                      <div className="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${Math.min(
                              student.progress,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Quiz */}
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm">
                          Quiz Performance
                        </span>
                      </div>

                      <p className="text-2xl font-bold text-slate-900">
                        {student.quizAverage}%
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        {student.quizAttempts}{' '}
                        {student.quizAttempts === 1
                          ? 'attempt'
                          : 'attempts'}
                      </p>
                    </div>

                    {/* Joined */}
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Joined
                        </span>
                      </div>

                      <p className="font-semibold text-slate-900">
                        {new Date(
                          student.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}