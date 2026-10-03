import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Globe,
  BookOpen,
  GraduationCap,
  Brain,
  Award,
  Trophy,
  Sparkles,
  ArrowRight,
  Languages,
  Volume2,
  TrendingUp,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Interactive Lessons',
    description: 'Learn through structured lessons with text, audio, and video content tailored to your level.',
  },
  {
    icon: GraduationCap,
    title: 'Vocabulary Builder',
    description: 'Expand your word bank with pronunciation guides, example sentences, and audio support.',
  },
  {
    icon: Languages,
    title: 'Grammar Mastery',
    description: 'Understand grammar rules with clear explanations, examples, and practice exercises.',
  },
  {
    icon: Brain,
    title: 'Smart Quizzes',
    description: 'Test your knowledge with multiple choice, true/false, and fill-in-the-blank questions.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed progress bars and performance analytics.',
  },
  {
    icon: Sparkles,
    title: 'AI Language Tutor',
    description: 'Get personalized help from an AI tutor that explains grammar, corrects mistakes, and practices conversations.',
  },
];

const languages = [
  { name: 'English', code: 'en', flag: '🇬🇧' },
  { name: 'French', code: 'fr', flag: '🇫🇷' },
  { name: 'Spanish', code: 'es', flag: '🇪🇸' },
  { name: 'German', code: 'de', flag: '🇩🇪' },
  { name: 'Italian', code: 'it', flag: '🇮🇹' },
  { name: 'Japanese', code: 'ja', flag: '🇯🇵' },
];

const steps = [
  {
    number: '01',
    title: 'Choose a Language',
    description: 'Select from English, French, Spanish, German, Italian, or Japanese. Switch or add more anytime.',
  },
  {
    number: '02',
    title: 'Study Content',
    description: 'Work through lessons, vocabulary, and grammar at your own pace with audio pronunciation support.',
  },
  {
    number: '03',
    title: 'Test Your Knowledge',
    description: 'Take quizzes to check your understanding and automatically track your scores and progress.',
  },
  {
    number: '04',
    title: 'Track & Achieve',
    description: 'Watch your progress grow, earn achievements, climb the leaderboard, and earn certificates.',
  },
];

const stats = [
  { label: 'Languages', value: '6+', icon: Globe },
  { label: 'Lessons', value: '100+', icon: BookOpen },
  { label: 'Learners', value: '10K+', icon: Users },
  { label: 'Quizzes', value: '500+', icon: Brain },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm font-medium text-muted-foreground mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Language Learning
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight animate-slide-up">
              LingoSphere
            </h1>
            <p className="mt-4 text-xl lg:text-2xl text-muted-foreground font-medium animate-slide-up">
              Learn Languages. Build Skills. Explore the World.
            </p>
            <p className="mt-6 text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up">
              A modern language learning platform with interactive lessons, vocabulary
              training, grammar guides, quizzes, and AI-powered tutoring — all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/languages">
                  Explore Languages
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Everything you need to learn</h2>
            <p className="mt-4 text-muted-foreground">
              Comprehensive tools and features designed to make language learning effective and enjoyable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-all hover:shadow-lg hover:-translate-y-1 duration-200">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-20 lg:py-28 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Supported Languages</h2>
            <p className="mt-4 text-muted-foreground">
              Start learning any of these languages today. More can be added anytime.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {languages.map((lang) => (
              <Card key={lang.code} className="transition-all hover:shadow-md hover:-translate-y-1 duration-200">
                <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                  <span className="text-4xl">{lang.flag}</span>
                  <p className="font-semibold">{lang.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">{lang.code}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">How LingoSphere Works</h2>
            <p className="mt-4 text-muted-foreground">
              A simple, structured approach to language learning that keeps you motivated.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="text-5xl font-bold text-primary/20 mb-4">{step.number}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <p className="text-3xl lg:text-4xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-80 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col lg:flex-row items-center justify-between gap-6 p-8 lg:p-12">
              <div className="max-w-xl text-center lg:text-left">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Ready to start your language journey?
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Join LingoSphere today and start learning for free. No credit card required.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/features">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
