'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';

type Language = {
  id: string;
  name: string;
  code: string;
};

type QuizQuestion = {
  id: string;
  language_id: string;
  question: string;
  question_type: string;
  options: string[] | string | null;
  correct_answer: string;
  difficulty: string | null;
  created_at: string;
};

export default function AdminQuizzesPage() {
  const [languages, setLanguages] = useState<Language[]>(
    []
  );

  const [questions, setQuestions] = useState<
    QuizQuestion[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [languageId, setLanguageId] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      { data: languageData, error: languageError },
      { data: questionData, error: questionError },
    ] = await Promise.all([
      supabase
        .from('languages')
        .select('id, name, code')
        .order('name'),

      supabase
        .from('quiz_questions')
        .select(
          'id, language_id, question, question_type, options, correct_answer, difficulty, created_at'
        )
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

    if (questionError) {
      console.error(
        'Error loading quiz questions:',
        questionError
      );
    }

    setLanguages(
      (languageData as Language[]) || []
    );

    setQuestions(
      (questionData as QuizQuestion[]) || []
    );

    setLoading(false);
  }

  function resetForm() {
    setLanguageId('');
    setQuestion('');
    setOptions('');
    setCorrectAnswer('');
    setDifficulty('beginner');
    setEditingId(null);
    setShowForm(false);
  }

  function getOptionsArray(
    value: QuizQuestion['options']
  ): string[] {
    if (Array.isArray(value)) {
      return value.map(String);
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.map(String);
        }
      } catch {
        return value
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  }

  function startEdit(item: QuizQuestion) {
    setEditingId(item.id);
    setLanguageId(item.language_id);
    setQuestion(item.question);

    const itemOptions = getOptionsArray(
      item.options
    );

    setOptions(itemOptions.join('\n'));

    setCorrectAnswer(item.correct_answer);
    setDifficulty(
      item.difficulty || 'beginner'
    );

    setShowForm(true);
  }

  function parseOptions(value: string) {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const parsedOptions = parseOptions(options);

    if (
      !languageId ||
      !question.trim() ||
      parsedOptions.length < 2 ||
      !correctAnswer.trim()
    ) {
      alert(
        'Language, question, at least two options and the correct answer are required.'
      );

      return;
    }

    const correctAnswerExists =
      parsedOptions.some(
        (option) =>
          option.toLowerCase() ===
          correctAnswer.trim().toLowerCase()
      );

    if (!correctAnswerExists) {
      alert(
        'The correct answer must exactly match one of the options.'
      );

      return;
    }

    setSaving(true);

    const quizData = {
      language_id: languageId,
      question: question.trim(),
      question_type: 'multiple_choice',
      options: parsedOptions,
      correct_answer: correctAnswer.trim(),
      difficulty,
    };

    if (editingId) {
      const { error } = await supabase
        .from('quiz_questions')
        .update(quizData)
        .eq('id', editingId);

      if (error) {
        console.error(error);
        alert(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('quiz_questions')
        .insert(quizData);

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

  async function deleteQuestion(
    id: string,
    questionText: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete this question?\n\n"${questionText}"`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);

      alert(
        `Could not delete the question.\n\n${error.message}`
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
                <HelpCircle className="h-6 w-6 text-indigo-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Quiz Management
                </h1>

                <p className="mt-1 text-slate-500">
                  Add, edit and manage quiz questions
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
              : 'Add Question'}
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              {editingId
                ? 'Edit Quiz Question'
                : 'Add New Quiz Question'}
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

              {/* Question */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Question
                </label>

                <textarea
                  value={question}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  placeholder='e.g. What does "Wasser" mean?'
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Answer Options
                </label>

                <textarea
                  value={options}
                  onChange={(e) =>
                    setOptions(e.target.value)
                  }
                  placeholder={`One option per line\nHouse\nFriend\nWater\nBook`}
                  rows={7}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />

                <p className="mt-1 text-xs text-slate-400">
                  Enter one option per line.
                </p>
              </div>

              {/* Correct Answer */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Correct Answer
                </label>

                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) =>
                    setCorrectAnswer(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Water"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />

                <p className="mt-1 text-xs text-slate-400">
                  Must exactly match one of the
                  options.
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
                    ? 'Update Question'
                    : 'Add Question'}
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

        {/* Question List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              All Quiz Questions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {questions.length} question
              {questions.length !== 1
                ? 's'
                : ''}{' '}
              in the database
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading quiz questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="p-10 text-center">

              <HelpCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <h3 className="font-semibold text-slate-700">
                No quiz questions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first quiz question
                using the button above.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-200">

              {questions.map((item) => {
                const itemOptions =
                  getOptionsArray(
                    item.options
                  );

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-5 p-6 transition hover:bg-slate-50 lg:flex-row lg:items-start lg:justify-between"
                  >

                    {/* Question Info */}
                    <div className="min-w-0 flex-1">

                      <div className="mb-2 flex flex-wrap items-center gap-2">

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

                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.question}
                      </h3>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">

                        {itemOptions.map(
                          (
                            option,
                            index
                          ) => (
                            <div
                              key={`${item.id}-${index}`}
                              className={`rounded-lg border px-3 py-2 text-sm ${
                                option ===
                                item.correct_answer
                                  ? 'border-green-200 bg-green-50 font-medium text-green-700'
                                  : 'border-slate-200 bg-slate-50 text-slate-600'
                              }`}
                            >
                              {option}
                            </div>
                          )
                        )}

                      </div>

                      <p className="mt-3 text-sm text-slate-500">
                        Correct answer:{' '}
                        <span className="font-medium text-green-600">
                          {item.correct_answer}
                        </span>
                      </p>

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
                          deleteQuestion(
                            item.id,
                            item.question
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}