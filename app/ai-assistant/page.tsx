'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  User,
  LayoutDashboard,
  BookOpen,
  Trophy,
  Settings,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Message = {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
};

export default function AiAssistantPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssistant() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(error);
      }

      const name = profile?.name || 'there';

      setUserName(name);

      setMessages([
        {
          id: 1,
          sender: 'assistant',
          text: `Hi ${name}! 👋 I'm your LingoSphere Assistant. I can help you understand the app, find learning sections, and figure out what to do next.`,
        },
      ]);

      setLoading(false);
    }

    loadAssistant();
  }, []);

  const generateAssistantResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes('hello') ||
      lowerQuestion.includes('hi')
    ) {
      return `Hi ${userName}! 👋 What would you like help with? You can ask about your dashboard, lessons, vocabulary, grammar, quizzes, progress, or other LingoSphere features.`;
    }

    if (
      lowerQuestion.includes('dashboard') ||
      lowerQuestion.includes('home')
    ) {
      return 'Your Dashboard gives you an overview of your learning progress, quiz performance, selected languages, and learning streak. 📊';
    }

    if (
      lowerQuestion.includes('lesson') ||
      lowerQuestion.includes('learn')
    ) {
      return 'You can access your language learning content through the Lessons section. Your selected language determines which learning content you see. 📚';
    }

    if (
      lowerQuestion.includes('vocabulary') ||
      lowerQuestion.includes('words')
    ) {
      return 'The Vocabulary section helps you learn words, meanings, pronunciation, examples, and audio when available. 🧠';
    }

    if (
      lowerQuestion.includes('grammar')
    ) {
      return 'The Grammar section contains explanations, examples, and exercises to help you understand the structure of your selected language. 📖';
    }

    if (
      lowerQuestion.includes('quiz') ||
      lowerQuestion.includes('test')
    ) {
      return 'You can use Quizzes to test what you have learned. Your quiz results contribute to your learning progress and quiz average. 🎯';
    }

    if (
      lowerQuestion.includes('progress') ||
      lowerQuestion.includes('score')
    ) {
      return 'The Progress section shows your learning progress across vocabulary, grammar, and quizzes. You can use it to see which areas need more practice. 📈';
    }

    if (
      lowerQuestion.includes('game') ||
      lowerQuestion.includes('games')
    ) {
      return 'Games give you another way to practice. Word Match is currently available, while additional games can be added later. 🎮';
    }

    if (
      lowerQuestion.includes('achievement') ||
      lowerQuestion.includes('badge')
    ) {
      return 'Achievements are unlocked when you complete learning milestones such as taking your first quiz, learning vocabulary, completing grammar topics, or reaching certain progress levels. 🏆';
    }

    if (
      lowerQuestion.includes('certificate')
    ) {
      return 'Certificates are connected to language completion. Complete 100% of a language to unlock its certificate. 📜';
    }

    if (
      lowerQuestion.includes('profile') ||
      lowerQuestion.includes('account')
    ) {
      return 'Your Profile section contains your account information and learning statistics, including quiz activity and your quiz average. 👤';
    }

    if (
      lowerQuestion.includes('setting') ||
      lowerQuestion.includes('settings')
    ) {
      return 'You can manage your application preferences from the Settings section. ⚙️';
    }

    if (
      lowerQuestion.includes('what should i do') ||
      lowerQuestion.includes('where should i start') ||
      lowerQuestion.includes('start')
    ) {
      return 'A good learning flow is: Vocabulary → Grammar → Quiz → Progress. You can also use Games for extra practice. 🚀';
    }

    if (
      lowerQuestion.includes('help')
    ) {
      return 'Of course! 🤖 Ask me about any LingoSphere section, such as Dashboard, Vocabulary, Grammar, Quizzes, Progress, Games, Achievements, Certificates, Profile, or Settings.';
    }

    return `I can help you navigate LingoSphere and understand its features. Try asking "Where can I find vocabulary?", "How does progress work?", or "What should I do first?"`;
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: trimmedMessage,
    };

    const assistantMessage: Message = {
      id: Date.now() + 1,
      sender: 'assistant',
      text: generateAssistantResponse(trimmedMessage),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      assistantMessage,
    ]);

    setMessage('');
  };

  const handleSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Loading AI Assistant...
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

      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>

          <h1 className="mt-6 text-4xl font-bold">
            AI Assistant
          </h1>

          <p className="mt-4 text-muted-foreground">
            Your guide to using LingoSphere.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <LayoutDashboard className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-sm font-medium">
                Dashboard
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-sm font-medium">
                Learning
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-sm font-medium">
                Progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Settings className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-sm font-medium">
                Settings
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="min-h-[400px] max-h-[500px] overflow-y-auto p-6">
              <div className="space-y-5">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-3 ${
                      item.sender === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    {item.sender === 'assistant' && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        item.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {item.text}
                    </div>

                    {item.sender === 'user' && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Try asking
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSuggestion(
                      'Where can I find vocabulary?'
                    )
                  }
                >
                  Find vocabulary
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSuggestion(
                      'How does my progress work?'
                    )
                  }
                >
                  Check progress
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSuggestion(
                      'What should I do first?'
                    )
                  }
                >
                  What should I do?
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSuggestion(
                      'Tell me about achievements'
                    )
                  }
                >
                  Achievements
                </Button>
              </div>
            </div>

            <div className="border-t p-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSend();
                }}
                className="flex gap-3"
              >
                <Input
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Ask your AI Assistant..."
                  className="flex-1"
                />

                <Button
                  type="submit"
                  disabled={!message.trim()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          AI Assistant currently uses built-in responses.
          Full AI integration can be added later.
        </p>
      </div>
    </div>
  );
}