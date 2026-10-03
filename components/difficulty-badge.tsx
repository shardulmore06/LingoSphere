'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Difficulty } from '@/lib/types';

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  beginner: {
    label: 'Beginner',
    className: 'bg-success/10 text-success border-success/20',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  advanced: {
    label: 'Advanced',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const config = difficultyConfig[difficulty] || difficultyConfig.beginner;
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
