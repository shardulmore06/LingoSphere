'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Settings as SettingsIcon,
  User,
  LogOut,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email || '');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(error);
      }

      setUserName(profile?.name || 'Student');

      const storedNotifications =
        localStorage.getItem('lingosphere-notifications');

      const storedDarkMode =
        localStorage.getItem('lingosphere-dark-mode');

      if (storedNotifications !== null) {
        setNotifications(storedNotifications === 'true');
      }

      if (storedDarkMode !== null) {
        setDarkMode(storedDarkMode === 'true');
      }

      setLoading(false);
    }

    loadSettings();
  }, []);

  const handleNotificationsChange = (
    value: boolean
  ) => {
    setNotifications(value);

    localStorage.setItem(
      'lingosphere-notifications',
      String(value)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleDarkModeChange = (value: boolean) => {
    setDarkMode(value);

    localStorage.setItem(
      'lingosphere-dark-mode',
      String(value)
    );

    document.documentElement.classList.toggle(
      'dark',
      value
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Loading settings...
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

      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <SettingsIcon className="h-8 w-8 text-primary" />
          </div>

          <h1 className="mt-6 text-4xl font-bold">
            Settings
          </h1>

          <p className="mt-4 text-muted-foreground">
            Manage your LingoSphere preferences.
          </p>
        </div>

        {saved && (
          <div className="mt-6 rounded-lg bg-primary/10 p-3 text-center text-sm font-medium text-primary">
            Settings saved successfully ✓
          </div>
        )}

        <div className="mt-10 space-y-6">
          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Name
                </p>
                <p className="mt-1 font-medium">
                  {userName}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 font-medium">
                  {email || 'Not available'}
                </p>
              </div>

              <Button
                variant="outline"
                asChild
              >
                <Link href="/profile">
                  View Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="font-medium">
                    Learning reminders
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Receive reminders to continue your learning.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleNotificationsChange(
                      !notifications
                    )
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    notifications
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                  aria-label="Toggle learning reminders"
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      notifications
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {darkMode ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                Appearance
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="font-medium">
                    Dark mode
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Switch between light and dark appearance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDarkModeChange(!darkMode)
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    darkMode
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      darkMode
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Account actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Account Actions
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}