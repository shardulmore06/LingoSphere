'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  User,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Message = {
  id: number;
  sender: 'user' | 'tutor';
  text: string;
};

export default function AiTutorPage() {
  const [languageName, setLanguageName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLanguage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: userLanguage, error } = await supabase
        .from('user_languages')
        .select('language_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (!userLanguage?.language_id) {
        setLanguageName('your selected language');
        setMessages([
          {
            id: 1,
            sender: 'tutor',
            text: 'Hi! 👋 Select a language first, then I can help you practice it.',
          },
        ]);
        setLoading(false);
        return;
      }

      const { data: language, error: languageError } =
        await supabase
          .from('languages')
          .select('name')
          .eq('id', userLanguage.language_id)
          .single();

      if (languageError) {
        console.error(languageError);
      }

      const name = language?.name || 'your selected language';

      setLanguageName(name);

      setMessages([
        {
          id: 1,
          sender: 'tutor',
          text: `Hi! 👋 I'm your AI Tutor. Let's practice ${name} together! You can ask me about grammar, vocabulary, pronunciation, sentences, or everyday conversation.`,
        },
      ]);

      setLoading(false);
    }

    loadLanguage();
  }, []);

  const generateTutorResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes('hello') ||
      lowerQuestion.includes('hi')
    ) {
      if (languageName.toLowerCase() === 'german') {
        return 'In German, you can say "Hallo" for hello. 👋 You can also say "Guten Morgen" for good morning and "Guten Abend" for good evening.';
      }

      return `Hello! 👋 In ${languageName}, start with a simple greeting and then practice introducing yourself.`;
    }

    if (
      lowerQuestion.includes('noun') ||
      lowerQuestion.includes('verb') ||
      lowerQuestion.includes('adjective')
    ) {
      return 'A noun is a person, place, thing, or idea. A verb describes an action or state. An adjective describes a noun. For example: "The small dog runs." Here, "dog" is the noun, "runs" is the verb, and "small" is the adjective. 📚';
    }

    if (
      lowerQuestion.includes('grammar') ||
      lowerQuestion.includes('grammer')
    ) {
      return `Grammar is the system of rules used to form correct sentences in ${languageName}. Start with basic sentence structure, pronouns, common verbs, articles, and word order. 📖`;
    }

    if (
      lowerQuestion.includes('vocabulary') ||
      lowerQuestion.includes('words') ||
      lowerQuestion.includes('word')
    ) {
      return `A good way to build ${languageName} vocabulary is to learn words in groups. For example, learn words related to food, travel, family, school, and everyday activities. 🧠`;
    }

    if (
      lowerQuestion.includes('pronunciation') ||
      lowerQuestion.includes('pronounce')
    ) {
      return `For pronunciation practice, say the word slowly first. Break it into smaller sounds, listen carefully, and then repeat it several times at normal speed. 🎧`;
    }

    if (
      lowerQuestion.includes('conversation') ||
      lowerQuestion.includes('speak') ||
      lowerQuestion.includes('talk')
    ) {
      return `Let's practice a simple ${languageName} conversation! 🗣️ Start by introducing yourself, saying where you are from, and asking the other person how they are.`;
    }

    if (
      lowerQuestion.includes('sentence') ||
      lowerQuestion.includes('make a sentence')
    ) {
      return `To build a sentence in ${languageName}, start with a subject and a verb, then add an object or extra information. For example: "I learn ${languageName}." ✍️`;
    }

    if (
      lowerQuestion.includes('quiz') ||
      lowerQuestion.includes('test') ||
      lowerQuestion.includes('practice question')
    ) {
      return `Quick practice! 🎯 Think of one ${languageName} word you recently learned. Try to write its meaning and use it in a sentence.`;
    }

    if (
      lowerQuestion.includes('thank') ||
      lowerQuestion.includes('thanks')
    ) {
      if (languageName.toLowerCase() === 'german') {
        return 'In German, "Danke" means "thank you". You can also say "Vielen Dank" to say "thank you very much." 😊';
      }

      return `In ${languageName}, learning polite expressions such as "thank you", "please", and "excuse me" is a great place to start. 😊`;
    }

    if (
      lowerQuestion.includes('help') ||
      lowerQuestion.includes('learn')
    ) {
      return `Absolutely! 🚀 We can work on ${languageName} step by step. Try asking me about vocabulary, grammar, pronunciation, or conversation practice.`;
    }

    return `I'd be happy to help you learn ${languageName}! 🤖 Try asking something specific, such as "Explain grammar", "Give me vocabulary practice", "How do I pronounce this?", or "Help me practice a conversation."`;
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

    const tutorMessage: Message = {
      id: Date.now() + 1,
      sender: 'tutor',
      text: generateTutorResponse(trimmedMessage),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      tutorMessage,
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
          Loading AI Tutor...
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
            AI Tutor
          </h1>

          <p className="mt-4 text-muted-foreground">
            Practice {languageName} with your personal language tutor.
          </p>
        </div>

        <Card className="mt-10 overflow-hidden">
          <CardContent className="p-0">
            <div className="min-h-[420px] max-h-[520px] overflow-y-auto p-6">
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
                    {item.sender === 'tutor' && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${
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
                      `Teach me some ${languageName} vocabulary`
                    )
                  }
                >
                  Learn vocabulary
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSuggestion(
                      `Explain ${languageName} grammar`
                    )
                  }
                >
                  Practice grammar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSuggestion(
                      `Help me practice a ${languageName} conversation`
                    )
                  }
                >
                  Practice conversation
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSuggestion(
                      `Help me with ${languageName} pronunciation`
                    )
                  }
                >
                  Pronunciation
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
                  placeholder="Ask your AI Tutor..."
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
          AI Tutor is currently using built-in learning responses.
          Full AI integration can be added later.
        </p>
      </div>
    </div>
  );
}