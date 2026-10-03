import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  GraduationCap,
  Languages,
  Brain,
  TrendingUp,
  Sparkles,
  Trophy,
  Award,
  Volume2,
  Gamepad2,
  ArrowRight,
  Search,
} from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Interactive Lessons', description: 'Structured lessons with text, images, audio, and video content for every level.' },
  { icon: GraduationCap, title: 'Vocabulary Builder', description: 'Learn new words with meanings, example sentences, pronunciation, and audio support.' },
  { icon: Languages, title: 'Grammar Guides', description: 'Comprehensive grammar explanations with examples and practice exercises.' },
  { icon: Brain, title: 'Smart Quizzes', description: 'Multiple choice, true/false, and fill-in-the-blank quizzes with automatic scoring.' },
  { icon: TrendingUp, title: 'Progress Tracking', description: 'Track lessons completed, vocabulary learned, quiz averages, and learning streaks.' },
  { icon: Trophy, title: 'Leaderboard', description: 'Compete with other learners and see where you rank on the global leaderboard.' },
  { icon: Award, title: 'Achievements & Certificates', description: 'Earn badges for milestones and certificates for completing language courses.' },
  { icon: Sparkles, title: 'AI Language Tutor', description: 'Get help understanding vocabulary, grammar, and practice conversations with an AI tutor.' },
  { icon: Volume2, title: 'Audio Pronunciation', description: 'Listen to correct pronunciation of words and phrases with built-in text-to-speech.' },
  { icon: Gamepad2, title: 'Learning Games', description: 'Reinforce your learning with fun browser-based games like Word Match and Word Scramble.' },
  { icon: Search, title: 'Content Search', description: 'Search across lessons, vocabulary, and grammar to find exactly what you need.' },
  { icon: Award, title: 'Multiple Languages', description: 'Learn English, French, Spanish, German, Italian, or Japanese — with more on the way.' },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b bg-gradient-to-br from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-20 lg:py-28 text-center max-w-3xl">
          <h1 className="text-4xl lg:text-5xl font-bold">Features</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Everything you need to learn a new language, all in one platform.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="transition-all hover:shadow-lg hover:-translate-y-1 duration-200">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-3 text-muted-foreground">Create your free account and start learning today.</p>
          <Button size="lg" asChild className="mt-6">
            <Link href="/register">
              Start Learning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
