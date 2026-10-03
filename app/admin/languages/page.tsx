'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Languages,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';

type Language = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  level: string | null;
  image: string | null;
};

export default function AdminLanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('A1');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLanguages();
  }, []);

  async function loadLanguages() {
    setLoading(true);

    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading languages:', error);
      setLanguages([]);
    } else {
      setLanguages((data as Language[]) || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setName('');
    setCode('');
    setDescription('');
    setLevel('A1');
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(language: Language) {
    setEditingId(language.id);
    setName(language.name);
    setCode(language.code);
    setDescription(language.description || '');
    setLevel(language.level || 'A1');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      alert('Language name and code are required.');
      return;
    }

    setSaving(true);

    const languageData = {
      name: name.trim(),
      code: code.trim().toLowerCase(),
      description: description.trim() || null,
      level,
    };

    if (editingId) {
      const { error } = await supabase
        .from('languages')
        .update(languageData)
        .eq('id', editingId);

      if (error) {
        console.error(error);
        alert(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('languages')
        .insert(languageData);

      if (error) {
        console.error(error);
        alert(error.message);
        setSaving(false);
        return;
      }
    }

    await loadLanguages();
    resetForm();
    setSaving(false);
  }

  async function deleteLanguage(
    id: string,
    languageName: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${languageName}?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from('languages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);

      alert(
        `Could not delete ${languageName}.\n\n${error.message}`
      );

      return;
    }

    await loadLanguages();
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
                <Languages className="h-6 w-6 text-indigo-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Language Management
                </h1>

                <p className="mt-1 text-slate-500">
                  Add, edit and manage languages available to
                  students.
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

            {showForm ? 'Cancel' : 'Add Language'}
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              {editingId
                ? 'Edit Language'
                : 'Add New Language'}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >

              {/* Language Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Language Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. German"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Language Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Language Code
                </label>

                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value)
                  }
                  placeholder="e.g. de"
                  maxLength={10}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 lowercase outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />

                <p className="mt-1 text-xs text-slate-400">
                  Example: en, de, fr, es, it, ja
                </p>
              </div>

              {/* Language Level */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Language Level
                </label>

                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option
                    value="A1"
                    className="bg-white text-slate-900"
                  >
                    A1 • Beginner
                  </option>

                  <option
                    value="A2"
                    className="bg-white text-slate-900"
                  >
                    A2 • Elementary
                  </option>

                  <option
                    value="B1"
                    className="bg-white text-slate-900"
                  >
                    B1 • Intermediate
                  </option>

                  <option
                    value="B2"
                    className="bg-white text-slate-900"
                  >
                    B2 • Upper Intermediate
                  </option>

                  <option
                    value="C1"
                    className="bg-white text-slate-900"
                  >
                    C1 • Advanced
                  </option>

                  <option
                    value="C2"
                    className="bg-white text-slate-900"
                  >
                    C2 • Proficiency
                  </option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Short description about the language"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Update Language'
                    : 'Add Language'}
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

        {/* Language List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              All Languages
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {languages.length} language
              {languages.length !== 1 ? 's' : ''} in the
              database
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading languages...
            </div>
          ) : languages.length === 0 ? (
            <div className="p-10 text-center">
              <Languages className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <h3 className="font-semibold text-slate-700">
                No languages found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first language using the button above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {languages.map((language) => (
                <div
                  key={language.id}
                  className="flex flex-col gap-4 p-6 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                >

                  {/* Language Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold uppercase text-indigo-600">
                      {language.code.slice(0, 2)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {language.name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        Code: {language.code}
                      </p>

                      {language.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {language.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {language.level || 'A1'}
                    </span>

                    <button
                      onClick={() =>
                        startEdit(language)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteLanguage(
                          language.id,
                          language.name
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