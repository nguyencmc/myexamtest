import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  Lightbulb,
  RotateCcw
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useExam, useExamQuestions } from '../hooks/useExamPractice';
import { useAuth } from '@/contexts/AuthContext';
import { createAttempt } from '../api';
import { cn } from '@/lib/utils';
import type { PracticeQuestion } from '../types';

export default function ExamPracticeRunner() {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const questionCount = parseInt(searchParams.get('count') || '10', 10);

  const { data: exam, isLoading: examLoading } = useExam(examId);
  const { data: questions, isLoading: questionsLoading, refetch } = useExamQuestions(examId, {
    limit: questionCount,
    shuffle: true,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [startTime, setStartTime] = useState<number>(Date.now());

  const currentQuestion = questions?.[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.answer;
  const progress = questions ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Reset start time when question changes
  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  const handleSelectAnswer = (choiceId: string) => {
    if (isChecked) return;
    setSelectedAnswer(choiceId);
  };

  const handleCheck = useCallback(async () => {
    if (!selectedAnswer || !currentQuestion || isChecked) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correct = selectedAnswer === currentQuestion.answer;

    setIsChecked(true);
    setStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
    }));

    // Save attempt if user is logged in
    if (user) {
      try {
        await createAttempt({
          user_id: user.id,
          question_id: currentQuestion.id,
          mode: 'practice',
          selected: selectedAnswer,
          is_correct: correct,
          time_spent_sec: timeSpent,
        });
      } catch (error) {
        console.error('Failed to save attempt:', error);
      }
    }
  }, [selectedAnswer, currentQuestion, isChecked, user, startTime]);

  const handleNext = () => {
    if (!questions) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsChecked(false);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setIsChecked(false);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsChecked(false);
    setShowExplanation(false);
    setStats({ correct: 0, wrong: 0 });
    refetch();
  };

  const isLoading = examLoading || questionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-96 w-full max-w-3xl mx-auto" />
        </main>
      </div>
    );
  }

  if (!exam || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-destructive mb-4">Không tìm thấy câu hỏi</p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </main>
      </div>
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;
  const isCompleted = isLastQuestion && isChecked;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Thoát
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {stats.correct}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3 text-destructive" />
              {stats.wrong}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{exam.title}</span>
            <span>
              Câu {currentIndex + 1}/{questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Question */}
            <div className="mb-6">
              <h2 className="text-lg font-medium leading-relaxed">
                {currentQuestion?.prompt}
              </h2>
            </div>

            {/* Choices */}
            <div className="space-y-3">
              {currentQuestion?.choices.map((choice) => {
                const isSelected = selectedAnswer === choice.id;
                const isCorrectChoice = choice.id === currentQuestion.answer;
                
                let choiceClass = 'border-border hover:border-primary/50 hover:bg-muted/50';
                
                if (isChecked) {
                  if (isCorrectChoice) {
                    choiceClass = 'border-green-500 bg-green-500/10';
                  } else if (isSelected && !isCorrectChoice) {
                    choiceClass = 'border-destructive bg-destructive/10';
                  }
                } else if (isSelected) {
                  choiceClass = 'border-primary bg-primary/5';
                }

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectAnswer(choice.id)}
                    disabled={isChecked}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all flex items-start gap-3',
                      choiceClass,
                      isChecked && 'cursor-default'
                    )}
                  >
                    <span className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2',
                      isChecked && isCorrectChoice
                        ? 'border-green-500 bg-green-500 text-white'
                        : isChecked && isSelected && !isCorrectChoice
                        ? 'border-destructive bg-destructive text-white'
                        : isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    )}>
                      {choice.id}
                    </span>
                    <span className="flex-1 pt-1">{choice.text}</span>
                    {isChecked && isCorrectChoice && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                    )}
                    {isChecked && isSelected && !isCorrectChoice && (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isChecked && currentQuestion?.explanation && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="mb-3"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  {showExplanation ? 'Ẩn giải thích' : 'Xem giải thích'}
                </Button>
                {showExplanation && (
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Result message */}
            {isChecked && (
              <div className={cn(
                'mt-4 p-3 rounded-lg text-center font-medium',
                isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
              )}>
                {isCorrect ? '🎉 Chính xác!' : '❌ Sai rồi!'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Câu trước
          </Button>

          {!isChecked ? (
            <Button
              onClick={handleCheck}
              disabled={!selectedAnswer}
              className="flex-1 max-w-[200px]"
            >
              Kiểm tra
            </Button>
          ) : isCompleted ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRestart}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Làm lại
              </Button>
              <Button onClick={() => navigate(-1)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Hoàn thành
              </Button>
            </div>
          ) : (
            <Button onClick={handleNext} className="flex-1 max-w-[200px]">
              Câu tiếp
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={isLastQuestion || !isChecked}
          >
            Câu sau
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Completion Stats */}
        {isCompleted && (
          <Card className="mt-6">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold mb-2">Kết quả luyện tập</h3>
              <p className="text-3xl font-bold text-primary mb-2">
                {stats.correct}/{questions.length}
              </p>
              <p className="text-muted-foreground">
                Tỷ lệ đúng: {Math.round((stats.correct / questions.length) * 100)}%
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
