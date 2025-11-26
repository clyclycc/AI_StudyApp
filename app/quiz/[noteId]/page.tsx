'use client';

import { useState, useEffect } from 'react';
import { QuizViewer } from '@/components/quiz-viewer';
import { QuizQuestion } from '@/lib/quiz-generator';
import { Button } from '@/components/ui/button';
import { Loader, BookOpen } from 'lucide-react';

interface QuizPageProps {
  params: { noteId: string };
}

export default function QuizPage({ params }: QuizPageProps) {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/quiz/${params.noteId}`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to generate quiz');
        }

        const data = await response.json();
        setQuiz(data.quiz);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load quiz'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [params.noteId]);

  const handleComplete = (score: number, total: number) => {
    console.log(`Quiz completed: ${score}/${total}`);
    // You can add additional logic here, like saving results to database
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">生成测验中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">生成测验失败</p>
          <p className="text-slate-500 text-sm">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="py-8">
        <QuizViewer questions={quiz} onComplete={handleComplete} />
      </div>
    </div>
  );
}
