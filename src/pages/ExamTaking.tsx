import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIExplanation } from '@/components/exam/AIExplanation';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  Home,
  List,
  LayoutGrid,
  Flag,
  Lock,
  LogIn,
  Share2,
  Download,
  Sparkles,
  Target,
  Zap,
  Medal,
  Keyboard
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  option_e: string | null;
  option_f: string | null;
  option_g: string | null;
  option_h: string | null;
  correct_answer: string;
  explanation: string | null;
  question_order: number;
}

interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
  question_count: number;
}

const ExamTaking = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [startTime] = useState(Date.now());

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Exam | null;
    },
  });

  // Fetch questions
  const { data: allQuestions, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', exam?.id],
    queryFn: async () => {
      if (!exam?.id) return [];
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('question_order', { ascending: true });
      
      if (error) throw error;
      return data as Question[];
    },
    enabled: !!exam?.id,
  });

  // Limit questions to 5 for non-authenticated users
  const MAX_GUEST_QUESTIONS = 5;
  const isGuest = !user;
  const questions = isGuest && allQuestions 
    ? allQuestions.slice(0, MAX_GUEST_QUESTIONS) 
    : allQuestions;
  const totalQuestionsInExam = allQuestions?.length || 0;
  const isLimitedAccess = isGuest && totalQuestionsInExam > MAX_GUEST_QUESTIONS;

  // Initialize timer
  useEffect(() => {
    if (exam?.duration_minutes && !isSubmitted) {
      setTimeLeft(exam.duration_minutes * 60);
    }
  }, [exam?.duration_minutes, isSubmitted]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // Helper function to check if answer is correct
  const isAnswerCorrect = (question: Question, userAnswers: string[] | undefined) => {
    if (!userAnswers || userAnswers.length === 0) return false;
    const correctAnswers = question.correct_answer?.split(',').map(a => a.trim()).sort() || [];
    const sortedUserAnswers = [...userAnswers].sort();
    return JSON.stringify(correctAnswers) === JSON.stringify(sortedUserAnswers);
  };

  // Auto submit when time runs out
  useEffect(() => {
    if (isSubmitted && timeLeft === 0 && exam && questions && questions.length > 0) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const correctCount = questions.filter(
        (q) => isAnswerCorrect(q, answers[q.id])
      ).length;

      supabase.from('exam_attempts').insert({
        exam_id: exam.id,
        user_id: user?.id || null,
        score: Math.round((correctCount / questions.length) * 100),
        total_questions: questions.length,
        correct_answers: correctCount,
        time_spent_seconds: timeSpent,
        answers: answers,
      });
    }
  }, [isSubmitted, timeLeft, exam, questions, answers, startTime, user?.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (isSubmitted) return;
    
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      const question = questions?.find(q => q.id === questionId);
      const correctAnswers = question?.correct_answer?.split(',').map(a => a.trim()) || [];
      const isMultiAnswer = correctAnswers.length > 1;
      
      if (isMultiAnswer) {
        // Multi-select: toggle the answer
        if (currentAnswers.includes(answer)) {
          return { ...prev, [questionId]: currentAnswers.filter(a => a !== answer) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, answer].sort() };
        }
      } else {
        // Single-select: replace the answer
        return { ...prev, [questionId]: [answer] };
      }
    });
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const flaggedCount = flaggedQuestions.size;

  const handleSubmit = useCallback(async () => {
    if (!questions || !exam) return;
    
    setIsSubmitted(true);
    setShowSubmitDialog(false);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = questions.filter(
      (q) => isAnswerCorrect(q, answers[q.id])
    ).length;

    // Save attempt to database
    await supabase.from('exam_attempts').insert({
      exam_id: exam.id,
      user_id: user?.id || null,
      score: Math.round((correctCount / questions.length) * 100),
      total_questions: questions.length,
      correct_answers: correctCount,
      time_spent_seconds: timeSpent,
      answers: answers,
    });
  }, [questions, exam, answers, startTime, user?.id]);

  const handleShareResults = async () => {
    const shareText = `🎉 Tôi vừa hoàn thành bài thi "${exam?.title}" với ${scorePercent}% điểm!\n\n✅ Đúng: ${correctCount}/${questions?.length} câu\n⏱️ Thời gian: ${formatTime(Math.floor((Date.now() - startTime) / 1000))}\n\nLuyện thi cùng AI tại AI-Exam.cloud`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kết quả thi: ${exam?.title}`,
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Đã sao chép!",
        description: "Kết quả đã được sao chép vào clipboard",
      });
    }
  };

  const currentQuestion = questions?.[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter(id => answers[id]?.length > 0).length;
  const progress = questions ? (answeredCount / questions.length) * 100 : 0;

  // Calculate results
  const correctCount = questions?.filter(
    (q) => isAnswerCorrect(q, answers[q.id])
  ).length || 0;
  const scorePercent = questions ? Math.round((correctCount / questions.length) * 100) : 0;

  // Keyboard shortcuts
  useEffect(() => {
    if (isSubmitted || !questions) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          e.preventDefault();
          const optionIndex = parseInt(e.key) - 1;
          const opts = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
          if (currentQuestion && optionIndex < opts.length) {
            const optionKey = `option_${opts[optionIndex].toLowerCase()}` as keyof Question;
            if (currentQuestion[optionKey]) {
              handleAnswerSelect(currentQuestion.id, opts[optionIndex]);
            }
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (currentQuestion) {
            toggleFlag(currentQuestion.id);
          }
          break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSubmitDialog(true);
          }
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHelp(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitted, questions, currentQuestionIndex, currentQuestion]);

  // Confetti effect when score >= 80%
  useEffect(() => {
    if (isSubmitted && scorePercent >= 80) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, scorePercent]);

  const getOptionClass = (questionId: string, option: string) => {
    const userAnswers = answers[questionId] || [];
    const isSelected = userAnswers.includes(option);
    
    if (!isSubmitted) {
      return isSelected
        ? 'border-primary bg-primary/10 ring-2 ring-primary'
        : 'border-border hover:border-primary/50 hover:bg-muted/50';
    }

    const question = questions?.find((q) => q.id === questionId);
    const correctAnswers = question?.correct_answer?.split(',').map(a => a.trim()) || [];
    const isCorrectOption = correctAnswers.includes(option);
    const userSelected = userAnswers.includes(option);

    if (isCorrectOption) {
      return 'border-green-500 bg-green-500/10 ring-2 ring-green-500';
    }
    if (userSelected && !isCorrectOption) {
      return 'border-red-500 bg-red-500/10 ring-2 ring-red-500';
    }
    return 'border-border opacity-50';
  };

  if (examLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!exam || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy đề thi</h1>
          <Link to="/exams">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Results screen
  if (isSubmitted) {
    const getScoreMessage = () => {
      if (scorePercent >= 90) return { text: "Xuất sắc! 🌟", color: "text-green-500" };
      if (scorePercent >= 80) return { text: "Tuyệt vời! 🎉", color: "text-green-500" };
      if (scorePercent >= 70) return { text: "Khá tốt! 👍", color: "text-blue-500" };
      if (scorePercent >= 50) return { text: "Cần cố gắng thêm! 💪", color: "text-yellow-500" };
      return { text: "Hãy ôn tập lại nhé! 📚", color: "text-red-500" };
    };
    
    const scoreMessage = getScoreMessage();

    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              >
                <div
                  className="w-3 h-3 rotate-45"
                  style={{
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 7)],
                  }}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Results Summary - Enhanced */}
        <section className="py-12 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              {/* Score Circle */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={scorePercent >= 70 ? 'hsl(var(--primary))' : scorePercent >= 50 ? '#EAB308' : '#EF4444'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(scorePercent / 100) * 440} 440`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{scorePercent}%</span>
                  <span className="text-sm text-muted-foreground">Điểm số</span>
                </div>
              </div>
              
              <h1 className={`text-3xl font-bold mb-2 ${scoreMessage.color}`}>
                {scoreMessage.text}
              </h1>
              <p className="text-muted-foreground mb-8">{exam?.title}</p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{scorePercent}%</div>
                  <div className="text-xs text-muted-foreground">Độ chính xác</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 hover:border-green-500/30 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-500">{correctCount}</div>
                  <div className="text-xs text-muted-foreground">Câu đúng</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 hover:border-red-500/30 transition-colors">
                  <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-500">{(questions?.length || 0) - correctCount}</div>
                  <div className="text-xs text-muted-foreground">Câu sai</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 hover:border-blue-500/30 transition-colors">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-500">
                    {formatTime(Math.floor((Date.now() - startTime) / 1000))}
                  </div>
                  <div className="text-xs text-muted-foreground">Thời gian</div>
                </div>
              </div>

              {/* Achievement Badge */}
              {scorePercent >= 80 && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 px-4 py-2 rounded-full mb-6">
                  <Medal className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    {scorePercent >= 90 ? 'Huy chương Vàng!' : 'Huy chương Bạc!'}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => navigate('/exams')} className="gap-2">
                  <Home className="w-4 h-4" />
                  Danh sách đề
                </Button>
                <Button onClick={() => window.location.reload()} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Làm lại
                </Button>
                <Button variant="outline" onClick={handleShareResults} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Review Answers */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Xem lại đáp án</h2>
            
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswers = answers[question.id] || [];
                const isCorrect = isAnswerCorrect(question, userAnswers);
                
                return (
                  <div key={question.id} className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-4">
                          Câu {index + 1}: {question.question_text}
                        </h3>
                        
                        <div className="grid gap-3">
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((option) => {
                            const optionKey = `option_${option.toLowerCase()}` as keyof Question;
                            const optionText = question[optionKey];
                            if (!optionText) return null;
                            
                            return (
                              <div
                                key={option}
                                className={`p-3 rounded-lg border transition-all ${getOptionClass(question.id, option)}`}
                              >
                                <span className="font-medium mr-2">{option}.</span>
                                {optionText as string}
                              </div>
                            );
                          })}
                        </div>

                        {question.explanation && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Giải thích:</strong> {question.explanation}
                            </p>
                          </div>
                        )}

                        <AIExplanation 
                          question={question} 
                          userAnswer={userAnswers.join(', ')} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Exam taking screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-foreground truncate max-w-[200px] md:max-w-none">
                {exam.title}
              </h1>
              <Badge variant="outline">
                Câu {currentQuestionIndex + 1}/{questions.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile Question Navigator Button */}
              <Drawer open={showNavigator} onOpenChange={setShowNavigator}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                  <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5" />
                      Danh sách câu hỏi
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-6">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                        <span className="text-muted-foreground">Đã làm ({answeredCount})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-muted" />
                        <span className="text-muted-foreground">Chưa làm ({questions.length - answeredCount})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30" />
                        <span className="text-muted-foreground">Đánh dấu ({flaggedCount})</span>
                      </div>
                    </div>

                    {/* Question Grid */}
                    <div className="grid grid-cols-6 gap-2 max-h-[50vh] overflow-y-auto">
                      {questions.map((q, index) => {
                        const isAnswered = answers[q.id]?.length > 0;
                        const isCurrent = index === currentQuestionIndex;
                        const isFlagged = flaggedQuestions.has(q.id);
                        
                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              setCurrentQuestionIndex(index);
                              setShowNavigator(false);
                            }}
                            className={`relative w-full aspect-square rounded-lg text-sm font-medium transition-all ${
                              isCurrent
                                ? 'bg-primary text-primary-foreground'
                                : isFlagged
                                ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                                : isAnswered
                                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {index + 1}
                            {isFlagged && (
                              <Flag className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-orange-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <Button 
                      onClick={() => {
                        setShowNavigator(false);
                        setShowSubmitDialog(true);
                      }} 
                      className="w-full mt-4"
                    >
                      Nộp bài ({answeredCount}/{questions.length})
                    </Button>
                  </div>
                </DrawerContent>
              </Drawer>

              {/* Timer */}
              <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg ${
                timeLeft <= 60 ? 'bg-red-500/20 text-red-500' : 'bg-muted'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold text-sm md:text-base">{formatTime(timeLeft)}</span>
              </div>

              <Button 
                onClick={() => setShowSubmitDialog(true)}
                className="hidden md:flex"
              >
                Nộp bài
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Đã trả lời {answeredCount}/{questions.length} câu
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Câu {currentQuestionIndex + 1}: {currentQuestion?.question_text}
              </h2>

              {currentQuestion && (() => {
                const correctAnswers = currentQuestion.correct_answer?.split(',').map(a => a.trim()) || [];
                const isMultiAnswer = correctAnswers.length > 1;
                
                return (
                  <>
                    {isMultiAnswer && (
                      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-500 font-medium">
                          💡 Câu hỏi này có nhiều đáp án đúng. Chọn tất cả các đáp án bạn cho là đúng.
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((option) => {
                        const optionKey = `option_${option.toLowerCase()}` as keyof Question;
                        const optionText = currentQuestion[optionKey];
                        if (!optionText) return null;
                        
                        const userAnswers = answers[currentQuestion.id] || [];
                        const isSelected = userAnswers.includes(option);
                        
                        return (
                          <button
                            key={option}
                            onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 ring-2 ring-primary'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              {option}
                            </span>
                            {optionText as string}
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="md:px-4"
                  size="icon"
                >
                  <ChevronLeft className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Câu trước</span>
                </Button>

                {/* Flag Button */}
                {currentQuestion && (
                  <Button
                    variant={flaggedQuestions.has(currentQuestion.id) ? "default" : "outline"}
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`md:px-4 ${flaggedQuestions.has(currentQuestion.id) ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                    size="icon"
                  >
                    <Flag className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">{flaggedQuestions.has(currentQuestion.id) ? "Bỏ đánh dấu" : "Đánh dấu"}</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="md:px-4"
                  size="icon"
                >
                  <span className="hidden md:inline">Câu sau</span>
                  <ChevronRight className="w-4 h-4 md:ml-2" />
                </Button>
              </div>

              {/* Guest Access Limitation Banner */}
              {isLimitedAccess && (
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        Bạn đang làm bản dùng thử
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Bạn chỉ có thể làm {MAX_GUEST_QUESTIONS} câu đầu tiên. Đăng nhập để làm toàn bộ {totalQuestionsInExam} câu hỏi của đề thi này.
                      </p>
                      <Link to="/auth">
                        <Button size="sm" className="gap-2">
                          <LogIn className="w-4 h-4" />
                          Đăng nhập ngay
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question Navigator - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 sticky top-32">
              <div className="flex items-center gap-2 mb-4">
                <List className="w-4 h-4" />
                <h3 className="font-semibold text-foreground">Danh sách câu hỏi</h3>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
                  <span className="text-muted-foreground">Đã làm</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/30" />
                  <span className="text-muted-foreground">Đánh dấu</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, index) => {
                  const isAnswered = answers[q.id]?.length > 0;
                  const isCurrent = index === currentQuestionIndex;
                  const isFlagged = flaggedQuestions.has(q.id);
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`relative w-full aspect-square rounded-lg text-sm font-medium transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : isFlagged
                          ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                          : isAnswered
                          ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="absolute top-0.5 right-0.5 w-2 h-2 text-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Button 
                onClick={() => setShowSubmitDialog(true)} 
                className="w-full mt-4"
              >
                Nộp bài ({answeredCount}/{questions.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Submit Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <Button onClick={() => setShowSubmitDialog(true)} className="w-full">
          Nộp bài ({answeredCount}/{questions.length})
        </Button>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận nộp bài?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đã trả lời {answeredCount}/{questions.length} câu hỏi.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-yellow-500">
                  Còn {questions.length - answeredCount} câu chưa trả lời!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục làm bài</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Nộp bài</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default ExamTaking;
