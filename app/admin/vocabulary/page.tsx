'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';

type Language = {
  id: string;
  name: string;
  code: string;
};

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

export default function AdminVocabularyPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [items, setItems] = useState<VocabularyItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [languageId, setLanguageId] = useState('');
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [difficulty, setDifficulty] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('beginner');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      { data: languageData, error: languageError },
      { data: vocabularyData, error: vocabularyError },
    ] = await Promise.all([
      supabase
        .from('languages')
        .select('id, name, code')
        .order('name'),

      supabase
        .from('vocabulary')
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

    if (vocabularyError) {
      console.error(
        'Error loading vocabulary:',
        vocabularyError
      );
    }

    setLanguages(
      (languageData as Language[]) || []
    );

    setItems(
      (vocabularyData as VocabularyItem[]) || []
    );

    setLoading(false);
  }

  function resetForm() {
    setLanguageId('');
    setWord('');
    setMeaning('');
    setExampleSentence('');
    setPronunciation('');
    setAudioUrl('');
    setDifficulty('beginner');
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: VocabularyItem) {
    setEditingId(item.id);
    setLanguageId(item.language_id);
    setWord(item.word);
    setMeaning(item.meaning);
    setExampleSentence(item.example_sentence);
    setPronunciation(item.pronunciation);
    setAudioUrl(item.audio_url || '');
    setDifficulty(item.difficulty);

    setShowForm(true);
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !languageId ||
      !word.trim() ||
      !meaning.trim()
    ) {
      alert(
        'Language, word and meaning are required.'
      );
      return;
    }

    setSaving(true);

    const vocabularyData = {
      language_id: languageId,
      word: word.trim(),
      meaning: meaning.trim(),
      example_sentence:
        exampleSentence.trim(),
      pronunciation: pronunciation.trim(),
      audio_url:
        audioUrl.trim() || null,
      difficulty,
    };

    if (editingId) {
      const { error } = await supabase
        .from('vocabulary')
        .update(vocabularyData)
        .eq('id', editingId);

      if (error) {
        console.error(error);
        alert(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('vocabulary')
        .insert(vocabularyData);

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

  async function deleteVocabulary(
    id: string,
    word: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${word}"?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from('vocabulary')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      alert(
        `Could not delete "${word}".\n\n${error.message}`
      );
      return;
    }

    await loadData();
  }

  function getLanguageName(
    languageId: string
  ) {
    const language = languages.find(
      (item) => item.id === languageId
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
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Vocabulary Management
                </h1>

                <p className="mt-1 text-slate-500">
                  Add, edit and manage vocabulary
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
              : 'Add Vocabulary'}
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              {editingId
                ? 'Edit Vocabulary'
                : 'Add New Vocabulary'}
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
                      e.target.value as
                        | 'beginner'
                        | 'intermediate'
                        | 'advanced'
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

              {/* Word */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Word
                </label>

                <input
                  type="text"
                  value={word}
                  onChange={(e) =>
                    setWord(e.target.value)
                  }
                  placeholder="e.g. Wasser"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Meaning */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Meaning
                </label>

                <input
                  type="text"
                  value={meaning}
                  onChange={(e) =>
                    setMeaning(e.target.value)
                  }
                  placeholder="e.g. Water"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Example Sentence */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Example Sentence
                </label>

                <textarea
                  value={exampleSentence}
                  onChange={(e) =>
                    setExampleSentence(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Ich trinke Wasser."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Pronunciation */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Pronunciation
                </label>

                <input
                  type="text"
                  value={pronunciation}
                  onChange={(e) =>
                    setPronunciation(
                      e.target.value
                    )
                  }
                  placeholder="e.g. VAH-ser"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Audio URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Audio URL
                </label>

                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) =>
                    setAudioUrl(e.target.value)
                  }
                  placeholder="Optional audio URL"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
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
                    ? 'Update Vocabulary'
                    : 'Add Vocabulary'}
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

        {/* Vocabulary List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              All Vocabulary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {items.length} vocabulary item
              {items.length !== 1
                ? 's'
                : ''}{' '}
              in the database
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading vocabulary...
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">

              <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <h3 className="font-semibold text-slate-700">
                No vocabulary found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first vocabulary item
                using the button above.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-200">

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 p-6 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                >

                  {/* Vocabulary Info */}
                  <div className="min-w-0 flex-1">

                    <div className="mb-2 flex flex-wrap items-center gap-2">

                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.word}
                      </h3>

                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                        {getLanguageName(
                          item.language_id
                        )}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                        {item.difficulty}
                      </span>

                    </div>

                    <p className="text-sm font-medium text-slate-700">
                      {item.meaning}
                    </p>

                    {item.pronunciation && (
                      <p className="mt-1 text-sm text-slate-500">
                        Pronunciation:{' '}
                        {item.pronunciation}
                      </p>
                    )}

                    {item.example_sentence && (
                      <p className="mt-2 text-sm italic text-slate-500">
                        “{item.example_sentence}”
                      </p>
                    )}

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
                        deleteVocabulary(
                          item.id,
                          item.word
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