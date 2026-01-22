import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  LogIn,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface EnrolledCourse {
  id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number;
  course?: {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    creator_name: string | null;
    lesson_count: number | null;
    duration_hours: number | null;
    level: string | null;
  };
}

const MyCourses = () => {
  const { user } = useAuth();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["my-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_course_enrollments")
        .select(`
          *,
          course:courses(id, title, slug, image_url, creator_name, lesson_count, duration_hours, level)
        `)
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      return data as EnrolledCourse[];
    },
    enabled: !!user?.id,
  });

  const getLevelLabel = (level: string | null) => {
    switch (level) {
      case "beginner":
        return "Cơ bản";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      default:
        return level || "Cơ bản";
    }
  };

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-primary";
    return "bg-yellow-500";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem khóa học</h1>
            <p className="text-muted-foreground mb-6">
              Bạn cần đăng nhập để xem danh sách khóa học đã đăng ký
            </p>
            <Link to="/auth">
              <Button size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Khóa học của tôi</h1>
              <p className="text-muted-foreground">
                {enrollments?.length || 0} khóa học đã đăng ký
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : enrollments && enrollments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Course Image */}
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
                    
                    {/* Progress Overlay */}
                    {enrollment.progress_percentage >= 100 ? (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Hoàn thành
                        </Badge>
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-background/90">
                          {enrollment.progress_percentage}%
                        </Badge>
                      </div>
                    )}

                    {/* Play Overlay */}
                    <Link to={`/course/${enrollment.course_id}/learn`}>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-7 h-7 text-primary fill-primary" />
                        </div>
                      </div>
                    </Link>
                  </div>

                  <CardContent className="p-4">
                    {/* Course Info */}
                    <Link to={`/course/${enrollment.course_id}/learn`}>
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {enrollment.course?.title || "Khóa học"}
                      </h3>
                    </Link>

                    {enrollment.course?.creator_name && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {enrollment.course.creator_name}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {enrollment.course?.level && (
                        <Badge
                          variant="outline"
                          className={getLevelColor(enrollment.course.level)}
                        >
                          {getLevelLabel(enrollment.course.level)}
                        </Badge>
                      )}
                      {enrollment.course?.lesson_count && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {enrollment.course.lesson_count} bài học
                        </span>
                      )}
                      {enrollment.course?.duration_hours && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {enrollment.course.duration_hours}h
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tiến độ</span>
                        <span className="font-medium">
                          {enrollment.progress_percentage}%
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all ${getProgressColor(
                            enrollment.progress_percentage
                          )}`}
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Enrolled Date */}
                    <p className="text-xs text-muted-foreground mb-4">
                      Đăng ký:{" "}
                      {format(new Date(enrollment.enrolled_at), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </p>

                    {/* Action Button */}
                    <Link to={`/course/${enrollment.course_id}/learn`}>
                      <Button className="w-full gap-2">
                        {enrollment.progress_percentage >= 100 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Xem lại khóa học
                          </>
                        ) : enrollment.progress_percentage > 0 ? (
                          <>
                            <Play className="w-4 h-4" />
                            Tiếp tục học
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Bắt đầu học
                          </>
                        )}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Chưa đăng ký khóa học nào
              </h2>
              <p className="text-muted-foreground mb-6">
                Khám phá các khóa học và bắt đầu hành trình học tập của bạn
              </p>
              <Link to="/courses">
                <Button>
                  Khám phá khóa học
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MyCourses;