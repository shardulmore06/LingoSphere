import { Target, Eye, Heart, Users, Globe, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To make language learning accessible, effective, and enjoyable for everyone, everywhere.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description: 'A world where language barriers no longer exist, and everyone can connect across cultures.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description: 'Education first, user-centered design, and continuous improvement in everything we build.',
  },
];

const stats = [
  { label: 'Languages', value: '6+', icon: Globe },
  { label: 'Learners', value: '10K+', icon: Users },
  { label: 'Lessons', value: '100+', icon: BookOpen },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b bg-gradient-to-br from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-20 lg:py-28 text-center max-w-3xl">
          <h1 className="text-4xl lg:text-5xl font-bold">About LingoSphere</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            LingoSphere is a modern language learning platform built to help students and
            lifelong learners master new languages through structured lessons, vocabulary
            practice, grammar guides, interactive quizzes, and AI-powered tutoring.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => (
              <Card key={v.title}>
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <p className="text-3xl lg:text-4xl font-bold">{s.value}</p>
                <p className="text-sm opacity-80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
