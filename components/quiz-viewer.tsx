'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/lib/quiz-generator';
import { Button } from '@/components/ui/button';

interface QuizViewerProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}

export function QuizViewer({ questions, onComplete }: QuizViewerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);

  const question = questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== null;

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const score = selectedAnswers.filter(
      (answer, idx) => answer === questions[idx].correctAnswer
    ).length;
    setShowResults(true);
    onComplete(score, questions.length);
  };

  if (showResults) {
    const score = selectedAnswers.filter(
      (answer, idx) => answer === questions[idx].correctAnswer
    ).length;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">测验完成！</h2>
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-blue-600 mb-2">
            {percentage}%
          </div>
          <p className="text-lg text-gray-600">
            你答对了 <span className="font-bold">{score}</span> / {questions.length} 题
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg ${
                selectedAnswers[idx] === q.correctAnswer
                  ? 'bg-green-50 border-2 border-green-500'
                  : 'bg-red-50 border-2 border-red-500'
              }`}
            >
              <p className="font-semibold mb-2">{q.question}</p>
              <p className="text-sm">
                你的答案：<span className="font-semibold">{q.options[selectedAnswers[idx]!]}</span>
              </p>
              {selectedAnswers[idx] !== q.correctAnswer && (
                <p className="text-sm text-green-700 mt-1">
                  正确答案：<span className="font-semibold">{q.options[q.correctAnswer]}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-600">
          第 {currentQuestion + 1} / {questions.length} 题
        </h3>
        <div className="w-full mx-4 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">{question.question}</h2>
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(idx)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === idx
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className="font-semibold">
                {String.fromCharCode(65 + idx)}.
              </span>{' '}
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          上一题
        </Button>
        <div className="flex-1" />
        {currentQuestion === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={!isAnswered}
            className="bg-green-600 hover:bg-green-700"
          >
            提交答案
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
            className="bg-blue-600 hover:bg-blue-700"
          >
            下一题
          </Button>
        )}
      </div>
    </div>
  );
}
