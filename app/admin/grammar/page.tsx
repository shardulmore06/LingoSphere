'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  BookOpenText,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';

type Language = {
  id: string;
  name: string;
  code: string;
};

type GrammarItem = {
  id: string;
  language_id: string;
  title: string;
  explanation: string;
  examples: string[] | string | null;
  exercises:
    | {
        q: string;
        a: string;
      }[]
    | string
    | null;
  difficulty: string | null;
  created_at: string;
};

export default function AdminGrammarPage() {
  const [languages, setLanguages] = useState<Language[]>(
    []
  );

  const [grammarItems, setGrammarItems] = useState<
    GrammarItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [languageId, setLanguageId] = useState('');
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [examples, setExamples] = useState('');
  const [exercises, setExercises] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      { data: languageData, error: languageError },
      { data: grammarData, error: grammarError },
    ] = await Promise.all([
      supabase
        .from('languages')
        .select('id, name, code')
        .order('name'),

      supabase
        .from('grammar')
        .select('*')
        .order('created_at', {
          ascending: false,
        }),
    ]);

    if (languageError) {
      console.error(
        'Error loading languages:',
        languageError
      );
    }

    if (grammarError) {
      console.error(
        'Error loading grammar:',
        grammarError
      );
    }

    setLanguages(
      (languageData as Language[]) || []
    );

    setGrammarItems(
      (grammarData as GrammarItem[]) || []
    );

    setLoading(false);
  }

  function resetForm() {
    setLanguageId('');
    setTitle('');
    setExplanation('');
    setExamples('');
    setExercises('');
    setDifficulty('beginner');
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: GrammarItem) {
    setEditingId(item.id);

    setLanguageId(item.language_id);
    setTitle(item.title);
    setExplanation(item.explanation);
    setDifficulty(item.difficulty || 'beginner');

    if (Array.isArray(item.examples)) {
      setExamples(item.examples.join('\n'));
    } else {
      setExamples(item.examples || '');
    }

    if (Array.isArray(item.exercises)) {
      setExercises(
        item.exercises
          .map(
            (exercise) =>
              `${exercise.q} | ${exercise.a}`
          )
          .join('\n')
      );
    } else {
      setExercises(item.exercises || '');
    }

    setShowForm(true);
  }

  function parseExamples(value: string) {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function parseExercises(value: string) {
    return value
      .split('\n')
      .map((line) => {
        const [question, answer] =
          line.split('|');

        return {
          q: question?.trim() || '',
          a: answer?.trim() || '',
        };
      })
      .filter(
        (exercise) =>
          exercise.q && exercise.a
      );
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !languageId ||
      !title.trim() ||
      !explanation.trim()
    ) {
      alert(
        'Language, title and explanation are required.'
      );

      return;
    }

    setSaving(true);

    const grammarData = {
      language_id: languageId,
      title: title.trim(),
      explanation: explanation.trim(),
      examples: parseExamples(examples),
      exercises: parseExercises(exercises),
      difficulty,
    };

    if (editingId) {
      const { error } = await supabase
        .from('grammar')
        .update(grammarData)
        .eq('id', editingId);

      if (error) {
        console.error(error);
        alert(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('grammar')
        .insert(grammarData);

      if (error) {
        console.error(error);
        alert(error.message);
        setSaving(false);
        return;
      }
    }

    await loadData();

    resetForm();

    setSaving(false);
  }

  async function deleteGrammar(
    id: string,
    title: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from('grammar')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);

      alert(
        `Could not delete "${title}".\n\n${error.message}`
      );

      return;
    }

    await loadData();
  }

  function getLanguageName(
    id: string
  ) {
    const language = languages.find(
      (item) => item.id === id
    );

    return language
      ? `${language.name} (${language.code})`
      : 'Unknown language';
  }

  function getExampleCount(
    examples: GrammarItem['examples']
  ) {
    if (Array.isArray(examples)) {
      return examples.length;
    }

    if (typeof examples === 'string') {
      try {
        const parsed = JSON.parse(examples);

        return Array.isArray(parsed)
          ? parsed.length
          : 0;
      } catch {
        return examples
          .split('\n')
          .filter(Boolean).length;
      }
    }

    return 0;
  }

  function getExerciseCount(
    exercises: GrammarItem['exercises']
  ) {
    if (Array.isArray(exercises)) {
      return exercises.length;
    }

    if (typeof exercises === 'string') {
      try {
        const parsed = JSON.parse(exercises);

        return Array.isArray(parsed)
          ? parsed.length
          : 0;
      } catch {
        return 0;
      }
    }

    return 0;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 p-3">
                <BookOpenText className="h-6 w-6 text-indigo-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Grammar Management
                </h1>

                <p className="mt-1 text-slate-500">
                  Add, edit and manage grammar lessons
                  for your languages.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />

            {showForm
              ? 'Cancel'
              : 'Add Grammar'}
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              {editingId
                ? 'Edit Grammar Topic'
                : 'Add New Grammar Topic'}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >

              {/* Language */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Language
                </label>

                <select
                  value={languageId}
                  onChange={(e) =>
                    setLanguageId(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                >
                  <option
                    value=""
                    className="bg-white text-slate-900"
                  >
                    Select a language
                  </option>

                  {languages.map(
                    (language) => (
                      <option
                        key={language.id}
                        value={language.id}
                        className="bg-white text-slate-900"
                      >
                        {language.name} (
                        {language.code})
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option
                    value="beginner"
                    className="bg-white text-slate-900"
                  >
                    Beginner
                  </option>

                  <option
                    value="intermediate"
                    className="bg-white text-slate-900"
                  >
                    Intermediate
                  </option>

                  <option
                    value="advanced"
                    className="bg-white text-slate-900"
                  >
                    Advanced
                  </option>
                </select>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Grammar Topic
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. German Personal Pronouns"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Explanation */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Explanation
                </label>

                <textarea
                  value={explanation}
                  onChange={(e) =>
                    setExplanation(
                      e.target.value
                    )
                  }
                  placeholder="Explain the grammar rule..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Examples */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Examples
                </label>

                <textarea
                  value={examples}
                  onChange={(e) =>
                    setExamples(e.target.value)
                  }
                  placeholder={`One example per line\nIch bin Student.\nDu bist nett.`}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Enter one example per line.
                </p>
              </div>

              {/* Exercises */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Exercises
                </label>

                <textarea
                  value={exercises}
                  onChange={(e) =>
                    setExercises(
                      e.target.value
                    )
                  }
                  placeholder={`Question | Answer\nWhat is "I am"? | Ich bin\nWhat is "you are"? | Du bist`}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  One exercise per line using:
                  Question | Answer
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-end gap-3 md:col-span-2">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Update Grammar'
                    : 'Add Grammar'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

              </div>
            </form>
          </div>
        )}

        {/* Grammar List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              All Grammar Topics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {grammarItems.length} grammar topic
              {grammarItems.length !== 1
                ? 's'
                : ''}{' '}
              in the database
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading grammar...
            </div>
          ) : grammarItems.length === 0 ? (
            <div className="p-10 text-center">

              <BookOpenText className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <h3 className="font-semibold text-slate-700">
                No grammar topics found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first grammar topic
                using the button above.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-200">

              {grammarItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 p-6 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                >

                  {/* Grammar Info */}
                  <div className="min-w-0 flex-1">

                    <div className="mb-2 flex flex-wrap items-center gap-2">

                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                        {getLanguageName(
                          item.language_id
                        )}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                        {item.difficulty ||
                          'beginner'}
                      </span>

                    </div>

                    <p className="line-clamp-2 text-sm text-slate-600">
                      {item.explanation}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>
                        Examples:{' '}
                        {getExampleCount(
                          item.examples
                        )}
                      </span>

                      <span>
                        Exercises:{' '}
                        {getExerciseCount(
                          item.exercises
                        )}
                      </span>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-3">

                    <button
                      onClick={() =>
                        startEdit(item)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteGrammar(
                          item.id,
                          item.title
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}