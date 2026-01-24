import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Clock, 
  FileText, 
  Target, 
  Users, 
  ArrowLeft, 
  Play, 
  BookOpen, 
  BarChart3,
  Sparkles,
  Trophy,
  CheckCircle2,
  Keyboard,
  Share2,
  Bookmark,
  TrendingUp,
  Home
} from "lucide-react";

const ExamDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ["exam-detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*, exam_categories(name, slug)")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: questionCount } = useQuery({
    queryKey: ["exam-questions-count", exam?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("exam_id", exam?.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!exam?.id,
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Dễ";
      case "medium":
        return "Trung bình";
      case "hard":
        return "Khó";
      default:
        return difficulty;
    }
  };

  if (examLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy đề thi</h1>
          <Button onClick={() => navigate("/exams")}>Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="text-primary hover:underline flex items-center gap-1">
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/exams" className="text-primary hover:underline">
              Đề thi
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground truncate max-w-[200px]">{exam.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {exam.exam_categories && (
                  <Badge variant="secondary" className="gap-1">
                    <BookOpen className="w-3 h-3" />
                    {(exam.exam_categories as { name: string }).name}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={getDifficultyColor(exam.difficulty || "medium")}
                >
                  {getDifficultyLabel(exam.difficulty || "medium")}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                {exam.title}
              </h1>
              
              {exam.description && (
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  {exam.description}
                </p>
              )}
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{questionCount || exam.question_count || 0} câu hỏi</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{exam.duration_minutes || 60} phút</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{exam.attempt_count?.toLocaleString() || 0} lượt thi</span>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <Card className="w-full lg:w-80 shadow-lg border-primary/20">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Sẵn sàng bắt đầu?</h3>
                  <p className="text-sm text-muted-foreground">
                    Thời gian sẽ bắt đầu tính ngay khi bạn vào làm bài
                  </p>
                </div>
                
                <Button
                  size="lg"
                  className="w-full text-lg gap-2 shadow-button"
                  onClick={() => navigate(`/exam/${slug}/take`)}
                >
                  <Sparkles className="w-5 h-5" />
                  Bắt đầu làm bài
                </Button>
                
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Bookmark className="w-4 h-4" />
                    Lưu
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin đề thi */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Thông tin chi tiết
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {questionCount || exam.question_count || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Câu hỏi</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {exam.duration_minutes || 60}
                      </p>
                      <p className="text-sm text-muted-foreground">Phút</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {exam.pass_rate || 75}%
                      </p>
                      <p className="text-sm text-muted-foreground">Tỷ lệ đạt</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {exam.attempt_count?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Lượt thi</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hướng dẫn */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-primary" />
                  Hướng dẫn làm bài
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Phím tắt hỗ trợ</p>
                      <p className="text-sm text-muted-foreground">
                        Sử dụng phím ← → hoặc A/D để di chuyển, 1-8 để chọn đáp án, F để đánh dấu
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Tự động lưu</p>
                      <p className="text-sm text-muted-foreground">
                        Đáp án được lưu tự động, bạn có thể quay lại sửa bất cứ lúc nào
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Tự động nộp bài</p>
                      <p className="text-sm text-muted-foreground">
                        Bài thi sẽ tự động nộp khi hết thời gian
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">AI giải thích đáp án</p>
                      <p className="text-sm text-muted-foreground">
                        Sau khi nộp bài, AI sẽ giải thích chi tiết từng câu hỏi
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thống kê */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Thống kê
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Tỷ lệ hoàn thành</span>
                      <span className="font-medium">{exam.pass_rate || 75}%</span>
                    </div>
                    <Progress value={exam.pass_rate || 75} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Điểm trung bình</span>
                      <span className="font-medium">7.2/10</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Mẹo đạt điểm cao</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">💡</span>
                    <span>Đọc kỹ câu hỏi trước khi trả lời</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">⏰</span>
                    <span>Phân bổ thời gian hợp lý cho từng câu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">🔖</span>
                    <span>Đánh dấu câu khó để quay lại sau</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✅</span>
                    <span>Kiểm tra lại trước khi nộp bài</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
          <Button
            size="lg"
            className="w-full text-lg gap-2 shadow-button"
            onClick={() => navigate(`/exam/${slug}/take`)}
          >
            <Play className="w-5 h-5" />
            Bắt đầu làm bài
          </Button>
        </div>
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default ExamDetail;
