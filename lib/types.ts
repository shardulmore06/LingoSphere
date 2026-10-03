export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type UserRole = 'student' | 'admin';
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Language {
  id: string;
  name: string;
  code: string;
  description: string;
  image_url: string | null;
  difficulty: Difficulty;
  created_at: string;
}

export interface Lesson {
  id: string;
  language_id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  difficulty: Difficulty;
  estimated_minutes: number;
  created_at: string;
}

export interface VocabularyItem {
  id: string;
  language_id: string;
  word: string;
  meaning: string;
  example_sentence: string;
  pronunciation: string;
  audio_url: string | null;
  difficulty: Difficulty;
  created_at: string;
}

export interface GrammarTopic {
  id: string;
  language_id: string;
  title: string;
  explanation: string;
  examples: string[];
  exercises: { q: string; a: string }[];
  difficulty: Difficulty;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  language_id: string;
  question: string;
  question_type: QuestionType;
  options: string[];
  correct_answer: string;
  difficulty: Difficulty;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  language_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  language_id: string;
  lessons_completed: number;
  vocabulary_completed: number;
  grammar_completed: number;
  quiz_average: number;
  progress_percentage: number;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  earned_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'premium' | 'pro';
  status: string;
  expires_at: string | null;
  created_at: string;
}

export interface UserLanguage {
  user_id: string;
  language_id: string;
  started_at: string;
}
