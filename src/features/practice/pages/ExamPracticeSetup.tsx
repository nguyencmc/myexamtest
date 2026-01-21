import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, PlayCircle, BookOpen, Settings, Clock, Target } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useExam } from '../hooks/useExamPractice';

export default function ExamPracticeSetup() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { data: exam, isLoading, error } = useExam(examId);

  const [questionCount, setQuestionCount] = useState('10');
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');

  const handleStart = () => {
    if (mode === 'practice') {
      const params = new URLSearchParams({
        count: questionCount,
        source: 'exam',
      });
      navigate(`/exam-practice/run/${examId}?${params.toString()}`);
    } else {
      // Navigate to exam mode with timer
      navigate(`/exam/${exam?.slug}/take`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full max-w-xl" />
        </main>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-destructive">Không tìm thấy đề thi</p>
          <Button variant="link" onClick={() => navigate('/exams')}>
            Quay lại
          </Button>
        </main>
      </div>
    );
  }

  const maxQuestions = exam.question_count || 0;
  const questionOptions = [10, 20, 30, 50].filter((n) => n <= maxQuestions);
  if (maxQuestions > 0 && !questionOptions.includes(maxQuestions)) {
    questionOptions.push(maxQuestions);
  }
  questionOptions.sort((a, b) => a - b);

  const getDifficultyLabel = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return 'Trung bình';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Settings className="h-5 w-5" />
                <span>Thiết lập luyện tập</span>
              </div>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              {exam.description && (
                <CardDescription>{exam.description}</CardDescription>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Badge variant="outline">
                  <BookOpen className="mr-1 h-3 w-3" />
                  {exam.question_count || 0} câu hỏi
                </Badge>
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  {exam.duration_minutes || 60} phút
                </Badge>
                <Badge variant="secondary">
                  <Target className="mr-1 h-3 w-3" />
                  {getDifficultyLabel(exam.difficulty)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mode Selection */}
              <div className="space-y-2">
                <Label>Chế độ</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={mode === 'practice' ? 'default' : 'outline'}
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => setMode('practice')}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span className="font-medium">Luyện tập</span>
                    <span className="text-xs opacity-70">Xem đáp án ngay</span>
                  </Button>
                  <Button
                    type="button"
                    variant={mode === 'exam' ? 'default' : 'outline'}
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => setMode('exam')}
                  >
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Thi thử</span>
                    <span className="text-xs opacity-70">Tính giờ, chấm điểm</span>
                  </Button>
                </div>
              </div>

              {/* Question Count - only for practice mode */}
              {mode === 'practice' && (
                <div className="space-y-2">
                  <Label htmlFor="question-count">Số câu hỏi</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger id="question-count">
                      <SelectValue placeholder="Chọn số câu" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionOptions.map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} câu
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Start Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleStart}
                disabled={maxQuestions === 0}
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                {mode === 'practice' ? 'Bắt đầu luyện tập' : 'Bắt đầu thi thử'}
              </Button>

              {maxQuestions === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Đề thi này chưa có câu hỏi
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
