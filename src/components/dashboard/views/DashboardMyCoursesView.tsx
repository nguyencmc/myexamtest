import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WishlistButton } from "@/components/course/WishlistButton";
import {
  GraduationCap,
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  ChevronRight,
  Heart,
  Star,
  Users,
  PlayCircle,
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

export const DashboardMyCoursesView = () => {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
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

  const { data: wishlistCourses, isLoading: wishlistLoading } = useQuery({
    queryKey: ["wishlist-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: wishlist, error } = await supabase
        .from("course_wishlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!wishlist || wishlist.length === 0) return [];

      const courseIds = wishlist.map((w) => w.course_id).filter(Boolean) as string[];
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title, slug, image_url, creator_name, rating, student_count")
        .in("id", courseIds);

      return wishlist.map((item) => ({
        ...item,
        course: courses?.find((c) => c.id === item.course_id),
      })) as WishlistCourse[];
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

  return (
    <div className="p-4 sm:p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Khóa học của tôi</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý và theo dõi quá trình học tập
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="enrolled" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Đã đăng ký ({enrollments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="gap-2">
            <Heart className="w-4 h-4" />
            Yêu thích ({wishlistCourses?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          {enrollmentsLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
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
            <div className="grid md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="overflow-hidden hover:shadow-lg transition-all group"
                >
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

                    <Link to={`/course/${enrollment.course_id}/learn`}>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-7 h-7 text-primary fill-primary" />
                        </div>
                      </div>
                    </Link>
                  </div>

                  <CardContent className="p-4">
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
                    </div>

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

                    <Link to={`/course/${enrollment.course_id}/learn`}>
                      <Button className="w-full gap-2" size="sm">
                        {enrollment.progress_percentage >= 100 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Xem lại
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
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                Chưa đăng ký khóa học nào
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Khám phá các khóa học và bắt đầu hành trình học tập
              </p>
              <Link to="/courses">
                <Button size="sm">
                  Khám phá khóa học
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist">
          {wishlistLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : wishlistCourses && wishlistCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {wishlistCourses.map((item) => (
                <div key={item.id} className="group relative">
                  <Link
                    to={`/course/${item.course?.slug || item.course_id}`}
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
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
                          {item.course?.title || "Khóa học"}
                        </h4>
                        {item.course?.creator_name && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.course.creator_name}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {item.course?.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {item.course.rating.toFixed(1)}
                            </span>
                          )}
                          {item.course?.student_count && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {item.course.student_count.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  {item.course_id && (
                    <div className="absolute top-3 right-3 z-10">
                      <WishlistButton
                        isInWishlist={isInWishlist(item.course_id)}
                        onToggle={() => toggleWishlist(item.course_id!)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                Chưa có khóa học yêu thích
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Thêm các khóa học vào danh sách yêu thích để theo dõi
              </p>
              <Link to="/courses">
                <Button size="sm">
                  Khám phá khóa học
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
