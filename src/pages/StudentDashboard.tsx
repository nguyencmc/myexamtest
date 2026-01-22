import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { AITutorButton } from '@/components/ai/AITutorButton';
import { AchievementsBadgeDisplay } from '@/components/achievements/AchievementsBadgeDisplay';
import { useAchievements } from '@/hooks/useAchievements';
import { WishlistButton } from '@/components/course/WishlistButton';
import { useWishlist } from '@/hooks/useWishlist';
import { PracticeTodayWidget } from '@/components/dashboard/PracticeTodayWidget';
import { PracticeStatsWidget } from '@/components/dashboard/PracticeStatsWidget';
import { 
  BookOpen, 
  FileText, 
  Headphones, 
  Layers,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Flame,
  Star,
  BarChart3,
  GraduationCap,
  Play,
  Heart,
  Users,
  PlayCircle
} from 'lucide-react';

interface Stats {
  totalExamsTaken: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  points: number;
  level: number;
  flashcardsLearned: number;
}

interface RecentAttempt {
  id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  exam?: {
    title: string;
    slug: string;
  };
}

interface WeeklyProgress {
  day: string;
  attempts: number;
  correct: number;
}

interface EnrolledCourse {
  id: string;
  course_id: string;
  enrolled_at: string;
  progress_percentage: number;
  course?: {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    creator_name: string | null;
  };
}

interface WishlistCourse {
  id: string;
  course_id: string;
  created_at: string;
  course?: {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    creator_name: string | null;
    rating: number | null;
    student_count: number | null;
  };
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, isTeacher } = useUserRole();
  const { checkAndAwardAchievements, getUserProgress } = useAchievements();
  
  const [stats, setStats] = useState<Stats>({
    totalExamsTaken: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    points: 0,
    level: 1,
    flashcardsLearned: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [wishlistCourses, setWishlistCourses] = useState<WishlistCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const { isInWishlist, toggleWishlist, refetch: refetchWishlist } = useWishlist();

  useEffect(() => {
    if (user) {
      fetchData();
      // Check achievements on load
      checkAchievements();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAchievements = async () => {
    const progress = await getUserProgress();
    await checkAndAwardAchievements(progress);
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch profile stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (profile) {
      setStats({
        totalExamsTaken: profile.total_exams_taken || 0,
        totalQuestionsAnswered: profile.total_questions_answered || 0,
        totalCorrectAnswers: profile.total_correct_answers || 0,
        points: profile.points || 0,
        level: profile.level || 1,
        flashcardsLearned: 0,
      });
    }

    // Fetch recent attempts with exam details
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', user?.id)
      .order('completed_at', { ascending: false })
      .limit(5);

    if (attempts && attempts.length > 0) {
      // Fetch exam details for each attempt
      const examIds = [...new Set(attempts.map(a => a.exam_id).filter(Boolean))];
      const { data: exams } = await supabase
        .from('exams')
        .select('id, title, slug')
        .in('id', examIds);

      const attemptsWithExams = attempts.map(attempt => ({
        ...attempt,
        exam: exams?.find(e => e.id === attempt.exam_id),
      }));

      setRecentAttempts(attemptsWithExams);
    }

    // Fetch flashcard progress
    const { count: flashcardsCount } = await supabase
      .from('user_flashcard_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('is_remembered', true);

    setStats(prev => ({
      ...prev,
      flashcardsLearned: flashcardsCount || 0,
    }));

    // Calculate weekly progress
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: weekAttempts } = await supabase
      .from('exam_attempts')
      .select('completed_at, correct_answers')
      .eq('user_id', user?.id)
      .gte('completed_at', weekAgo.toISOString());

    const progressByDay: Record<string, { attempts: number; correct: number }> = {};
    weekDays.forEach(day => {
      progressByDay[day] = { attempts: 0, correct: 0 };
    });

    weekAttempts?.forEach(attempt => {
      const date = new Date(attempt.completed_at);
      const dayName = weekDays[date.getDay()];
      progressByDay[dayName].attempts += 1;
      progressByDay[dayName].correct += attempt.correct_answers || 0;
    });

    setWeeklyProgress(weekDays.map(day => ({
      day,
      ...progressByDay[day],
    })));

    // Calculate streak (consecutive days with activity)
    let currentStreak = 0;
    const attemptDates = new Set(
      weekAttempts?.map(a => new Date(a.completed_at).toDateString()) || []
    );
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      if (attemptDates.has(checkDate.toDateString())) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    setStreak(currentStreak);

    // Fetch enrolled courses
    const { data: enrollments } = await supabase
      .from('user_course_enrollments')
      .select('*')
      .eq('user_id', user?.id)
      .order('enrolled_at', { ascending: false })
      .limit(6);

    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map(e => e.course_id);
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, slug, image_url, creator_name')
        .in('id', courseIds);

      const enrollmentsWithCourses = enrollments.map(enrollment => ({
        ...enrollment,
        course: courses?.find(c => c.id === enrollment.course_id),
      }));

      setEnrolledCourses(enrollmentsWithCourses);
    }

    // Fetch wishlist courses
    const { data: wishlist } = await supabase
      .from('course_wishlists')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(6);

    if (wishlist && wishlist.length > 0) {
      const wishlistCourseIds = wishlist.map(w => w.course_id).filter(Boolean) as string[];
      const { data: wishlistCoursesData } = await supabase
        .from('courses')
        .select('id, title, slug, image_url, creator_name, rating, student_count')
        .in('id', wishlistCourseIds);

      const wishlistWithCourses = wishlist.map(item => ({
        ...item,
        course: wishlistCoursesData?.find(c => c.id === item.course_id),
      }));

      setWishlistCourses(wishlistWithCourses);
    }

    setLoading(false);
  };

  const accuracy = stats.totalQuestionsAnswered > 0 
    ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100) 
    : 0;

  const pointsToNextLevel = (stats.level * 100) - (stats.points % 100);
  const levelProgress = ((stats.points % 100) / 100) * 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Đăng nhập để xem Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Theo dõi tiến độ học tập và thống kê cá nhân của bạn
          </p>
          <Link to="/auth">
            <Button size="lg">Đăng nhập ngay</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Theo dõi tiến độ học tập của bạn</p>
          </div>
          <div className="flex gap-3">
            {(isAdmin || isTeacher) && (
              <Link to={isAdmin ? "/admin" : "/teacher"}>
                <Button variant="outline">
                  {isAdmin ? 'Admin Dashboard' : 'Teacher Dashboard'}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-border/50 col-span-1">
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.points.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Điểm tích lũy</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 col-span-1">
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-3">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">Level {stats.level}</p>
              <p className="text-sm text-muted-foreground">{pointsToNextLevel} điểm → lv.{stats.level + 1}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 col-span-1">
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{streak}</p>
              <p className="text-sm text-muted-foreground">Ngày liên tiếp</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 col-span-1">
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalExamsTaken}</p>
              <p className="text-sm text-muted-foreground">Đề thi đã làm</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 col-span-1">
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Độ chính xác</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 col-span-1">
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.flashcardsLearned}</p>
              <p className="text-sm text-muted-foreground">Flashcard đã nhớ</p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses Section */}
        <Card className="border-border/50 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Khóa học của tôi
              </CardTitle>
              <Link to="/courses">
                <Button variant="ghost" size="sm" className="gap-1">
                  Xem tất cả
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Các khóa học bạn đã đăng ký</CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Bạn chưa đăng ký khóa học nào</p>
                <Link to="/courses">
                  <Button className="mt-4" variant="outline">
                    Khám phá khóa học
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map((enrollment) => (
                  <Link 
                    key={enrollment.id} 
                    to={`/course/${enrollment.course_id}/learn`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-border/50 h-full">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {enrollment.course?.image_url ? (
                          <img 
                            src={enrollment.course.image_url} 
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary fill-primary" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {enrollment.course?.title || 'Khóa học'}
                        </h4>
                        {enrollment.course?.creator_name && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {enrollment.course.creator_name}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tiến độ</span>
                            <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                          </div>
                          <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wishlist Section */}
        <Card className="border-border/50 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Khóa học yêu thích
              </CardTitle>
              <Link to="/courses">
                <Button variant="ghost" size="sm" className="gap-1">
                  Xem tất cả
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Các khóa học bạn đã lưu để xem sau</CardDescription>
          </CardHeader>
          <CardContent>
            {wishlistCourses.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Bạn chưa lưu khóa học nào</p>
                <Link to="/courses">
                  <Button className="mt-4" variant="outline">
                    Khám phá khóa học
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistCourses.map((item) => (
                  <div key={item.id} className="group relative">
                    <Link 
                      to={`/course/${item.course?.slug || item.course_id}`}
                      className="block"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow border-border/50 h-full">
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          {item.course?.image_url ? (
                            <img 
                              src={item.course.image_url} 
                              alt={item.course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                              <PlayCircle className="w-12 h-12 text-primary/50" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {item.course?.title || 'Khóa học'}
                          </h4>
                          {item.course?.creator_name && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.course.creator_name}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {item.course?.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                {item.course.rating.toFixed(1)}
                              </span>
                            )}
                            {item.course?.student_count != null && (
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {item.course.student_count.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <div className="absolute top-2 right-2">
                      <WishlistButton
                        isInWishlist={isInWishlist(item.course_id || '')}
                        onToggle={async () => {
                          await toggleWishlist(item.course_id || '');
                          // Remove from local state immediately
                          setWishlistCourses(prev => prev.filter(w => w.id !== item.id));
                        }}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Practice Widgets Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <PracticeTodayWidget />
          <PracticeStatsWidget />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Progress & Weekly Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tiến độ Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Level {stats.level}</span>
                  <span className="text-sm text-muted-foreground">Level {stats.level + 1}</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Còn {pointsToNextLevel} điểm nữa để lên level
                </p>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Hoạt động trong tuần
                </CardTitle>
                <CardDescription>Số lượt làm bài và câu đúng theo ngày</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-40">
                  {weeklyProgress.map((day, index) => {
                    const maxAttempts = Math.max(...weeklyProgress.map(d => d.attempts), 1);
                    const height = (day.attempts / maxAttempts) * 100;
                    const isToday = index === new Date().getDay();
                    
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center justify-end h-32">
                          <div 
                            className={`w-full max-w-8 rounded-t-md transition-all ${
                              isToday ? 'bg-primary' : 'bg-primary/30'
                            }`}
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                        </div>
                        <span className={`text-xs mt-2 ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                          {day.day}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {day.attempts}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/exams">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <FileText className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Làm đề thi</h3>
                      <p className="text-sm text-muted-foreground">Luyện tập ngay</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/flashcards">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                      <Layers className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Flashcards</h3>
                      <p className="text-sm text-muted-foreground">Học từ vựng</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/podcasts">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                      <Headphones className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Podcasts</h3>
                      <p className="text-sm text-muted-foreground">Luyện nghe</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="space-y-6">
            {/* Achievements */}
            <Link to="/achievements">
              <AchievementsBadgeDisplay />
            </Link>
            {/* Performance Summary */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Thống kê tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tổng câu hỏi đã làm</span>
                  <span className="font-semibold">{stats.totalQuestionsAnswered}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Câu trả lời đúng
                  </span>
                  <span className="font-semibold text-green-600">{stats.totalCorrectAnswers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Câu trả lời sai
                  </span>
                  <span className="font-semibold text-red-600">
                    {stats.totalQuestionsAnswered - stats.totalCorrectAnswers}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Độ chính xác</span>
                    <span className="font-bold text-primary">{accuracy}%</span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Attempts */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Lịch sử làm bài
                  </CardTitle>
                  <Link to="/history">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Xem tất cả
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentAttempts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Chưa có lịch sử làm bài</p>
                    <Link to="/exams">
                      <Button className="mt-4" variant="outline">
                        Làm đề thi đầu tiên
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAttempts.map((attempt) => (
                      <Link 
                        key={attempt.id} 
                        to={`/history/${attempt.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {attempt.exam?.title || 'Đề thi'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attempt.completed_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={attempt.score >= 70 ? 'default' : attempt.score >= 50 ? 'secondary' : 'destructive'}
                          >
                            {attempt.score}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {attempt.correct_answers}/{attempt.total_questions}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <AITutorButton />
      <Footer />
    </div>
  );
};

export default StudentDashboard;