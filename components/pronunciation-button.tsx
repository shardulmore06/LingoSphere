'use client';

import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PronunciationButtonProps {
  text: string;
  lang?: string;
  className?: string;
  size?: 'sm' | 'default' | 'icon';
}

const langMap: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  it: 'it-IT',
  ja: 'ja-JP',
};

export function PronunciationButton({
  text,
  lang = 'en',
  className,
  size = 'icon',
}: PronunciationButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const speak = () => {
    if (!supported) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[lang] || lang;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  if (!supported) return null;

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        speak();
      }}
      className={cn(speaking && 'text-primary', className)}
      aria-label="Pronounce"
    >
      <Volume2 className={cn('h-4 w-4', speaking && 'animate-pulse')} />
    </Button>
  );
}
