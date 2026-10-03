'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Gamepad2,
  CheckCircle2,
  RotateCcw,
  Trophy,
} from 'lucide-react';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type VocabularyItem = {
  id: string;
  language_id: string;
  word: string;
  meaning: string;
};

type GameQuestion = {
  word: string;
  correctAnswer: string;
  options: string[];
};

export default function GamesPage() {
  const [languageName, setLanguageName] = useState('');
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);

  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function loadGameData() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get the student's selected language
      const { data: userLanguage, error: userLanguageError } =
        await supabase
          .from('user_languages')
          .select('language_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

      if (userLanguageError) {
        console.error(userLanguageError);
        setLoading(false);
        return;
      }

      if (!userLanguage?.language_id) {
        setLoading(false);
        return;
      }

      const languageId = userLanguage.language_id;

      // Get language name
      const { data: language, error: languageError } = await supabase
        .from('languages')
        .select('name')
        .eq('id', languageId)
        .single();

      if (languageError) {
        console.error(languageError);
      }

      setLanguageName(language?.name || 'Language');

      // Get vocabulary
      const { data: vocabularyData, error: vocabularyError } =
        await supabase
          .from('vocabulary')
          .select('id, language_id, word, meaning')
          .eq('language_id', languageId);

      if (vocabularyError) {
        console.error(vocabularyError);
        setLoading(false);
        return;
      }

      setVocabulary((vocabularyData as VocabularyItem[]) || []);

      setLoading(false);
    }

    loadGameData();
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const createQuestions = () => {
    // Remove duplicate meanings
    const uniqueVocabulary = vocabulary.filter(
      (item, index, array) =>
        array.findIndex(
          (other) => other.meaning === item.meaning
        ) === index
    );

    if (uniqueVocabulary.length < 2) {
      return [];
    }

    // Select up to 10 random questions
    const selectedVocabulary = shuffleArray(uniqueVocabulary).slice(
      0,
      Math.min(10, uniqueVocabulary.length)
    );

    const generatedQuestions: GameQuestion[] = selectedVocabulary.map(
      (item) => {
        // Get possible wrong answers
        const wrongAnswersPool = uniqueVocabulary
          .filter(
            (other) =>
              other.id !== item.id &&
              other.meaning !== item.meaning
          )
          .map((other) => other.meaning);

        // Remove duplicate wrong answers
        const uniqueWrongAnswers = Array.from(
          new Set(wrongAnswersPool)
        );

        // Shuffle wrong answers
        const shuffledWrongAnswers =
          shuffleArray(uniqueWrongAnswers);

        // Maximum 3 wrong answers
        const wrongAnswers = shuffledWrongAnswers.slice(0, 3);

        // Create options
        const options = shuffleArray([
          item.meaning,
          ...wrongAnswers,
        ]);

        return {
          word: item.word,
          correctAnswer: item.meaning,
          options,
        };
      }
    );

    return generatedQuestions;
  };

  const startGame = () => {
    const newQuestions = createQuestions();

    if (newQuestions.length === 0) {
      return;
    }

    setQuestions(newQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setGameFinished(false);
    setGameStarted(true);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(answer);

    const question = questions[currentQuestion];

    if (answer === question.correctAnswer) {
      setScore((previousScore) => previousScore + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion >= questions.length - 1) {
      setGameFinished(true);
      return;
    }

    setSelectedAnswer(null);
    setCurrentQuestion((previousQuestion) => previousQuestion + 1);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameFinished(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuestions([]);
  };

  const currentQuestionData = questions[currentQuestion];

  const percentage =
    questions.length > 0
      ? Math.round((score / questions.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Loading games...
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

      {!gameStarted && (
        <>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>

            <h1 className="mt-6 text-4xl font-bold">
              Language Games
            </h1>

            <p className="mt-4 text-muted-foreground">
              Practice {languageName} vocabulary through fun
              interactive games.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Word Match */}
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  Word Match
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Match words with their correct meanings.
                </p>

                {vocabulary.length >= 2 ? (
                  <Button
                    className="mt-6 w-full"
                    onClick={startGame}
                  >
                    Start Game
                  </Button>
                ) : (
                  <p className="mt-6 text-sm text-muted-foreground">
                    Word Match needs at least 2 vocabulary words.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Quiz */}
            <Card>
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Trophy className="h-6 w-6 text-muted-foreground" />
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  Quick Quiz
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Test your language knowledge with quick questions.
                </p>

                <Button
                  className="mt-6 w-full"
                  variant="outline"
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Language Match */}
            <Card>
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  Language Match
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Match vocabulary pairs and improve your memory.
                </p>

                <Button
                  className="mt-6 w-full"
                  variant="outline"
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Score Challenge */}
            <Card>
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Trophy className="h-6 w-6 text-muted-foreground" />
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  Score Challenge
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Challenge yourself and try to achieve a high score.
                </p>

                <Button
                  className="mt-6 w-full"
                  variant="outline"
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {gameStarted && !gameFinished && currentQuestionData && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Word Match
              </p>

              <p className="font-semibold">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>

            <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Score: {score}
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  What does this word mean?
                </p>

                <h1 className="mt-4 text-4xl font-bold">
                  {currentQuestionData.word}
                </h1>
              </div>

              <div className="mt-10 grid gap-4">
                {currentQuestionData.options.map(
                  (option, index) => {
                    const isSelected =
                      selectedAnswer === option;

                    const isCorrect =
                      option ===
                      currentQuestionData.correctAnswer;

                    let buttonClass = '';

                    if (selectedAnswer !== null) {
                      if (isCorrect) {
                        buttonClass =
                          'border-green-500 bg-green-500/10';
                      } else if (isSelected) {
                        buttonClass =
                          'border-red-500 bg-red-500/10';
                      }
                    }

                    return (
                      <Button
                        key={`${currentQuestion}-${index}-${option}`}
                        variant="outline"
                        className={`h-auto min-h-14 justify-start whitespace-normal px-5 py-4 text-left ${buttonClass}`}
                        onClick={() =>
                          handleAnswer(option)
                        }
                        disabled={selectedAnswer !== null}
                      >
                        {option}

                        {selectedAnswer !== null &&
                          isCorrect && (
                            <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-green-600" />
                          )}
                      </Button>
                    );
                  }
                )}
              </div>

              {selectedAnswer !== null && (
                <div className="mt-8 text-center">
                  <Button onClick={handleNext}>
                    {currentQuestion >= questions.length - 1
                      ? 'Finish Game'
                      : 'Next Question'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {gameFinished && (
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-8 w-8 text-primary" />
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                Game Complete!
              </h1>

              <p className="mt-3 text-muted-foreground">
                You completed the Word Match game.
              </p>

              <div className="mt-8">
                <p className="text-5xl font-bold text-primary">
                  {score}/{questions.length}
                </p>

                <p className="mt-2 text-muted-foreground">
                  {percentage}% correct
                </p>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button onClick={startGame}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>

                <Button
                  variant="outline"
                  onClick={resetGame}
                >
                  Back to Games
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}