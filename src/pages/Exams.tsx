import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Bookmark,
  Play,
  BarChart3,
  Home
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExamCategory {
  id: string;
  name: string;
  slug: string;
}

interface Exam {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  question_count: number | null;
  attempt_count: number | null;
  category_id: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  category?: ExamCategory;
}

const ITEMS_PER_PAGE = 9;

const Exams = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [categoryResult, examResult] = await Promise.all([
      supabase.from("exam_categories").select("id, name, slug").order("name"),
      supabase.from("exams").select("*, exam_categories(id, name, slug)").order("created_at", { ascending: false })
    ]);

    if (categoryResult.data) {
      setCategories(categoryResult.data);
    }

    if (examResult.data) {
      const formattedExams = examResult.data.map(exam => ({
        ...exam,
        category: exam.exam_categories as ExamCategory | undefined
      }));
      setExams(formattedExams);
    }

    setLoading(false);
  };

  // Filter and sort exams
  const filteredExams = useMemo(() => {
    let result = [...exams];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(exam => 
        exam.title.toLowerCase().includes(query) ||
        exam.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(exam => 
        exam.category_id && selectedCategories.includes(exam.category_id)
      );
    }

    // Difficulty filter
    if (selectedDifficulty) {
      result = result.filter(exam => exam.difficulty === selectedDifficulty);
    }

    // Duration filter
    if (selectedDuration.length > 0) {
      result = result.filter(exam => {
        const duration = exam.duration_minutes || 0;
        return selectedDuration.some(range => {
          if (range === "short") return duration < 30;
          if (range === "medium") return duration >= 30 && duration <= 90;
          if (range === "long") return duration > 90;
          return false;
        });
      });
    }

    // Sort
    if (sortBy === "recent") {
      // Already sorted by created_at desc
    } else if (sortBy === "popular") {
      result.sort((a, b) => (b.attempt_count || 0) - (a.attempt_count || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "questions") {
      result.sort((a, b) => (b.question_count || 0) - (a.question_count || 0));
    }

    return result;
  }, [exams, searchQuery, selectedCategories, selectedDifficulty, selectedDuration, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const handleDurationToggle = (duration: string) => {
    setSelectedDuration(prev => 
      prev.includes(duration) 
        ? prev.filter(d => d !== duration)
        : [...prev, duration]
    );
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("recent");
    setSelectedCategories([]);
    setSelectedDifficulty("");
    setSelectedDuration([]);
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
      case "medium":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "advanced":
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string | null) => {
    if (!difficulty) return "N/A";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((page, idx) => (
          typeof page === "number" ? (
            <Button
              key={idx}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className="h-10 w-10"
            >
              {page}
            </Button>
          ) : (
            <span key={idx} className="px-2 text-muted-foreground">...</span>
          )
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="h-10 w-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link to="/" className="text-primary hover:underline flex items-center gap-1">
            <Home className="h-4 w-4" />
            Trang chủ
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Thư viện đề thi</span>
        </nav>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm đề thi theo tên, mã hoặc từ khóa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 h-12 text-base rounded-xl border-2 border-border focus:border-primary bg-card"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-foreground">Bộ lọc</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleReset}
                  className="text-primary hover:text-primary/80 h-auto p-0 font-medium"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Đặt lại
                </Button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Danh mục
                  </span>
                </div>
                <div className="space-y-2.5">
                  {categories.slice(0, 6).map(category => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Label 
                        htmlFor={`cat-${category.id}`}
                        className="text-sm cursor-pointer text-foreground"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Độ khó
                  </span>
                </div>
                <RadioGroup 
                  value={selectedDifficulty} 
                  onValueChange={(value) => {
                    setSelectedDifficulty(value);
                    setCurrentPage(1);
                  }}
                  className="space-y-2.5"
                >
                  {[
                    { value: "", label: "Tất cả" },
                    { value: "beginner", label: "Cơ bản" },
                    { value: "intermediate", label: "Trung bình" },
                    { value: "advanced", label: "Nâng cao" }
                  ].map(option => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem value={option.value} id={`diff-${option.value || 'all'}`} />
                      <Label 
                        htmlFor={`diff-${option.value || 'all'}`}
                        className="text-sm cursor-pointer text-foreground"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Duration Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Thời lượng
                  </span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { value: "short", label: "< 30 phút" },
                    { value: "medium", label: "30 - 90 phút" },
                    { value: "long", label: "1.5+ giờ" }
                  ].map(option => (
                    <div key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`dur-${option.value}`}
                        checked={selectedDuration.includes(option.value)}
                        onCheckedChange={() => handleDurationToggle(option.value)}
                      />
                      <Label 
                        htmlFor={`dur-${option.value}`}
                        className="text-sm cursor-pointer text-foreground"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Đề thi hiện có ({filteredExams.length})
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mới nhất</SelectItem>
                    <SelectItem value="popular">Phổ biến nhất</SelectItem>
                    <SelectItem value="name">Tên (A-Z)</SelectItem>
                    <SelectItem value="questions">Số câu hỏi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exams Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-6 bg-muted rounded-full w-24"></div>
                      <div className="h-6 w-6 bg-muted rounded"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </div>
                    <div className="h-11 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : paginatedExams.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-2">Không tìm thấy đề thi nào</p>
                <p className="text-sm text-muted-foreground">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-200 group"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${getDifficultyColor(exam.difficulty)} font-medium`}>
                        {getDifficultyLabel(exam.difficulty)}
                      </Badge>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Bookmark className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-foreground mb-4 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                      {exam.title}
                    </h3>

                    {/* Stats */}
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{exam.question_count || 0} Câu hỏi</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{exam.duration_minutes || 60} Phút</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full gap-2"
                      onClick={() => navigate(`/exam/${exam.slug}`)}
                    >
                      Bắt đầu
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {renderPagination()}
          </div>
        </div>
      </main>

      <FloatingActions />
      <Footer />
    </div>
  );
};

export default Exams;
