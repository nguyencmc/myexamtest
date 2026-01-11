import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Play,
  PlayCircle,
  Clock,
  Users,
  Star,
  Award,
  Globe,
  Infinity,
  FileText,
  Download,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  Monitor,
  Smartphone,
  Trophy,
  Lock,
  Volume2,
  Maximize,
  Pause,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  subcategory: string | null;
  topic: string | null;
  term_count: number | null;
  view_count: number | null;
  creator_name: string | null;
  is_official: boolean | null;
}

// Mock data for course sections
const courseSections = [
  {
    id: 1,
    title: "Giới thiệu khóa học",
    lessons: [
      { id: 1, title: "Chào mừng đến với khóa học", duration: "2:30", isPreview: true, type: "video" },
      { id: 2, title: "Cách học hiệu quả nhất", duration: "5:15", isPreview: true, type: "video" },
      { id: 3, title: "Tài liệu hướng dẫn", duration: "1 trang", isPreview: false, type: "document" },
    ],
  },
  {
    id: 2,
    title: "Kiến thức nền tảng",
    lessons: [
      { id: 4, title: "Các khái niệm cơ bản", duration: "15:20", isPreview: false, type: "video" },
      { id: 5, title: "Thực hành bài tập 1", duration: "10:00", isPreview: false, type: "video" },
      { id: 6, title: "Quiz kiểm tra", duration: "10 câu", isPreview: false, type: "quiz" },
    ],
  },
  {
    id: 3,
    title: "Nâng cao kỹ năng",
    lessons: [
      { id: 7, title: "Kỹ thuật nâng cao", duration: "20:45", isPreview: false, type: "video" },
      { id: 8, title: "Case study thực tế", duration: "25:00", isPreview: false, type: "video" },
      { id: 9, title: "Bài tập tổng hợp", duration: "15:30", isPreview: false, type: "video" },
    ],
  },
  {
    id: 4,
    title: "Dự án thực tế",
    lessons: [
      { id: 10, title: "Giới thiệu dự án", duration: "8:00", isPreview: false, type: "video" },
      { id: 11, title: "Xây dựng từ đầu", duration: "45:00", isPreview: false, type: "video" },
      { id: 12, title: "Hoàn thiện và deploy", duration: "30:00", isPreview: false, type: "video" },
      { id: 13, title: "Chứng chỉ hoàn thành", duration: "", isPreview: false, type: "certificate" },
    ],
  },
];

// Mock reviews
const reviews = [
  {
    id: 1,
    user: "Nguyễn Văn A",
    avatar: "",
    rating: 5,
    date: "2 tuần trước",
    comment: "Khóa học rất hay và chi tiết! Giảng viên giải thích dễ hiểu, có nhiều ví dụ thực tế. Tôi đã học được rất nhiều điều bổ ích.",
    helpful: 42,
  },
  {
    id: 2,
    user: "Trần Thị B",
    avatar: "",
    rating: 5,
    date: "1 tháng trước",
    comment: "Nội dung chất lượng, được cập nhật thường xuyên. Support nhanh chóng khi có thắc mắc. Highly recommended!",
    helpful: 38,
  },
  {
    id: 3,
    user: "Lê Minh C",
    avatar: "",
    rating: 4,
    date: "1 tháng trước",
    comment: "Khóa học tốt, phù hợp cho người mới bắt đầu. Tuy nhiên phần nâng cao có thể chi tiết hơn.",
    helpful: 25,
  },
  {
    id: 4,
    user: "Phạm Hoàng D",
    avatar: "",
    rating: 5,
    date: "2 tháng trước",
    comment: "Đây là khóa học tốt nhất mà tôi từng học! Giảng viên rất tận tâm và kiến thức được trình bày logic.",
    helpful: 56,
  },
];

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching course:", error);
    } else {
      setCourse(data);
    }
    setLoading(false);
  };

  // Generate random data for demo
  const rating = 4.7;
  const totalRatings = 12543;
  const totalStudents = 45678;
  const price = 499000;
  const originalPrice = 1299000;
  const discount = Math.round((1 - price / originalPrice) * 100);
  const totalHours = 24.5;
  const totalLessons = courseSections.reduce((acc, s) => acc + s.lessons.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không tìm thấy khóa học</h1>
          <p className="text-muted-foreground mb-4">Khóa học này không tồn tại hoặc đã bị xóa</p>
          <Button asChild>
            <Link to="/courses">Quay lại danh sách khóa học</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Dark Background */}
      <section className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Link to="/courses" className="hover:text-white">Khóa học</Link>
                <span>/</span>
                <span className="capitalize">{course.category}</span>
                {course.subcategory && (
                  <>
                    <span>/</span>
                    <span className="capitalize">{course.subcategory}</span>
                  </>
                )}
              </nav>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-gray-300 text-lg mb-4">
                {course.description || "Khóa học toàn diện giúp bạn nắm vững kiến thức từ cơ bản đến nâng cao với các bài học thực hành và dự án thực tế."}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {course.is_official && (
                  <Badge className="bg-yellow-500 text-black">
                    <Award className="w-3 h-3 mr-1" />
                    Bestseller
                  </Badge>
                )}
                <Badge variant="outline" className="border-green-500 text-green-400">
                  Mới cập nhật 01/2025
                </Badge>
              </div>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-yellow-400">{rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400">({totalRatings.toLocaleString()} đánh giá)</span>
                </div>
                <span className="text-gray-400">
                  <Users className="w-4 h-4 inline mr-1" />
                  {totalStudents.toLocaleString()} học viên
                </span>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>Giảng viên:</span>
                <Link to="#" className="text-purple-400 hover:underline font-medium">
                  {course.creator_name || "AI-Exam.cloud"}
                </Link>
              </div>

              {/* Language & Updates */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Tiếng Việt
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Phụ đề tiếng Việt
                </span>
              </div>
            </div>

            {/* Right: Video Preview Card - Visible on Desktop */}
            <div className="hidden lg:block">
              {/* This is just a placeholder, actual card is fixed */}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Preview - Mobile */}
            <div className="lg:hidden">
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-slate-900" />
                    ) : (
                      <Play className="w-8 h-8 text-slate-900 ml-1" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm">Xem trước khóa học này</p>
                </div>
              </div>
              
              {/* Mobile Price Card */}
              <div className="mt-4 p-4 bg-card rounded-xl border">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold">{price.toLocaleString()}₫</span>
                  <span className="text-lg text-muted-foreground line-through">{originalPrice.toLocaleString()}₫</span>
                  <Badge variant="destructive">{discount}% giảm</Badge>
                </div>
                <Button className="w-full h-12 text-lg mb-3">Mua ngay</Button>
                <Button variant="outline" className="w-full h-12 mb-4">Thêm vào giỏ hàng</Button>
                <p className="text-center text-sm text-muted-foreground">
                  Đảm bảo hoàn tiền trong 30 ngày
                </p>
              </div>
            </div>

            {/* What you'll learn */}
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Bạn sẽ học được gì
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Nắm vững kiến thức từ cơ bản đến nâng cao",
                  "Xây dựng dự án thực tế từ đầu đến cuối",
                  "Hiểu sâu các khái niệm quan trọng",
                  "Áp dụng vào công việc thực tế",
                  "Cập nhật xu hướng công nghệ mới nhất",
                  "Nhận chứng chỉ hoàn thành khóa học",
                  "Truy cập trọn đời vào nội dung",
                  "Hỗ trợ 24/7 từ giảng viên",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Nội dung khóa học</h2>
                <div className="text-sm text-muted-foreground">
                  {courseSections.length} phần • {totalLessons} bài học • {totalHours} giờ
                </div>
              </div>

              <Accordion type="multiple" className="border rounded-xl overflow-hidden">
                {courseSections.map((section, index) => (
                  <AccordionItem key={section.id} value={`section-${section.id}`} className="border-b last:border-b-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                      <div className="flex items-center gap-3 text-left">
                        <span className="font-semibold">Phần {index + 1}: {section.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {section.lessons.length} bài học
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pb-0">
                      <div className="divide-y">
                        {section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.type === "video" ? (
                                <PlayCircle className="w-4 h-4 text-muted-foreground" />
                              ) : lesson.type === "quiz" ? (
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              ) : lesson.type === "document" ? (
                                <Download className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Trophy className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className="text-sm">{lesson.title}</span>
                              {lesson.isPreview && (
                                <Badge variant="secondary" className="text-xs">
                                  Xem trước
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!lesson.isPreview && <Lock className="w-3 h-3 text-muted-foreground" />}
                              <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-bold mb-4">Yêu cầu</h2>
              <ul className="space-y-2">
                {[
                  "Không yêu cầu kiến thức trước, phù hợp cho người mới bắt đầu",
                  "Máy tính có kết nối internet",
                  "Tinh thần học hỏi và sẵn sàng thực hành",
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold mb-4">Mô tả</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  Chào mừng bạn đến với khóa học toàn diện này! Đây là khóa học được thiết kế đặc biệt 
                  để giúp bạn nắm vững kiến thức từ cơ bản đến nâng cao một cách có hệ thống.
                </p>
                <p className="mt-4">
                  Trong khóa học này, bạn sẽ được học các khái niệm quan trọng, thực hành với các 
                  bài tập thực tế, và xây dựng dự án hoàn chỉnh. Giảng viên sẽ hướng dẫn bạn từng 
                  bước một, đảm bảo bạn hiểu sâu và có thể áp dụng vào công việc thực tế.
                </p>
                <h3 className="font-semibold text-foreground mt-6 mb-2">Khóa học này dành cho ai?</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Người mới bắt đầu muốn học từ số 0</li>
                  <li>Người đã có kiến thức cơ bản muốn nâng cao</li>
                  <li>Sinh viên và người đi làm muốn bổ sung kỹ năng</li>
                  <li>Bất kỳ ai có đam mê học hỏi và phát triển</li>
                </ul>
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Giảng viên</h2>
              <div className="flex items-start gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {(course.creator_name || "AI")[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link to="#" className="text-lg font-semibold text-primary hover:underline">
                    {course.creator_name || "AI-Exam.cloud"}
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">Chuyên gia đào tạo</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      4.8 đánh giá
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      1,234 đánh giá
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      50,000 học viên
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      12 khóa học
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Với hơn 10 năm kinh nghiệm trong ngành, giảng viên đã đào tạo hàng nghìn học viên 
                    và giúp họ đạt được mục tiêu nghề nghiệp. Phương pháp giảng dạy thực tế, dễ hiểu 
                    và luôn cập nhật xu hướng mới nhất.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-bold mb-4">Đánh giá của học viên</h2>
              
              {/* Rating Summary */}
              <div className="flex flex-col md:flex-row gap-8 mb-6 p-6 bg-card border rounded-xl">
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-500 mb-1">{rating}</div>
                  <div className="flex justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">Đánh giá khóa học</div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { stars: 5, percent: 78 },
                    { stars: 4, percent: 15 },
                    { stars: 3, percent: 5 },
                    { stars: 2, percent: 1 },
                    { stars: 1, percent: 1 },
                  ].map((row) => (
                    <div key={row.stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-20">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < row.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <Progress value={row.percent} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-10">{row.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback>{review.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{review.user}</span>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          Hữu ích ({review.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {reviews.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                >
                  {showAllReviews ? "Ẩn bớt" : `Xem tất cả ${reviews.length} đánh giá`}
                  {showAllReviews ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </Button>
              )}
            </div>
          </div>

          {/* Right Sidebar - Sticky Card */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-card border rounded-xl overflow-hidden shadow-lg">
                {/* Video Preview */}
                <div className="relative aspect-video bg-slate-900 cursor-pointer group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-slate-900" />
                      ) : (
                        <Play className="w-6 h-6 text-slate-900 ml-1" />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-sm text-center">Xem trước khóa học</p>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold">{price.toLocaleString()}₫</span>
                    <span className="text-lg text-muted-foreground line-through">{originalPrice.toLocaleString()}₫</span>
                    <Badge variant="destructive">{discount}% giảm</Badge>
                  </div>

                  <p className="text-destructive text-sm mb-4 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Ưu đãi kết thúc sau 2 ngày!
                  </p>

                  <Button className="w-full h-12 text-lg mb-3">
                    Mua ngay
                  </Button>
                  <Button variant="outline" className="w-full h-12 mb-4">
                    Thêm vào giỏ hàng
                  </Button>

                  <p className="text-center text-sm text-muted-foreground mb-6">
                    Đảm bảo hoàn tiền trong 30 ngày
                  </p>

                  {/* Course includes */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Khóa học bao gồm:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-muted-foreground" />
                        {totalHours} giờ video theo yêu cầu
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {totalLessons} bài học
                      </li>
                      <li className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        Tài liệu tải xuống
                      </li>
                      <li className="flex items-center gap-2">
                        <Infinity className="w-4 h-4 text-muted-foreground" />
                        Truy cập trọn đời
                      </li>
                      <li className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                        Xem trên mọi thiết bị
                      </li>
                      <li className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        Chứng chỉ hoàn thành
                      </li>
                    </ul>
                  </div>

                  {/* Share & Wishlist */}
                  <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                      Yêu thích
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingActions />
      <Footer />
    </div>
  );
};

export default CourseDetail;
