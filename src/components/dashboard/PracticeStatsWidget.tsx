import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePracticeStats } from '@/features/practice/hooks/usePracticeStats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  BarChart3, 
  Target, 
  Clock, 
  Eye, 
  BookOpen,
  TrendingUp,
  Award,
  RefreshCw,
  LogIn
} from 'lucide-react';

export const PracticeStatsWidget = () => {
  const { user } = useAuth();
  const { stats, loading, refetch } = usePracticeStats();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Not logged in
  if (!user) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Thống kê luyện thi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <LogIn className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              Đăng nhập để xem thống kê
            </p>
            <Link to="/auth">
              <Button size="sm">Đăng nhập</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Thống kê luyện thi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = stats.accuracy7Days.totalAttempts > 0 || stats.recentExams.length > 0;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Thống kê luyện thi
            </CardTitle>
            <CardDescription>Tiến độ 7 ngày gần nhất</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Bạn chưa làm bài nào</p>
            <Link to="/practice">
              <Button variant="outline" size="sm">
                Bắt đầu luyện tập
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* A) 7-day Accuracy */}
            <div className="p-4 rounded-lg border border-border/50 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Độ chính xác 7 ngày</h4>
                  <p className="text-sm text-muted-foreground">
                    {stats.accuracy7Days.correctAttempts}/{stats.accuracy7Days.totalAttempts} câu đúng
                  </p>
                </div>
                <div className="ml-auto">
                  <span className={`text-2xl font-bold ${getAccuracyColor(stats.accuracy7Days.accuracy)}`}>
                    {stats.accuracy7Days.accuracy}%
                  </span>
                </div>
              </div>
              <div className="relative">
                <Progress value={stats.accuracy7Days.accuracy} className="h-2" />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(stats.accuracy7Days.accuracy)}`}
                  style={{ width: `${stats.accuracy7Days.accuracy}%` }}
                />
              </div>
            </div>

            {/* B) Recent Exams */}
            <div>
              <h4 className="font-medium text-foreground flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" />
                Bài thi gần đây
              </h4>
              
              {stats.recentExams.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có bài thi nào hoàn thành
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.recentExams.map((exam) => (
                    <div 
                      key={exam.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Award className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {exam.set_title || 'Bài thi'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exam.submitted_at && format(new Date(exam.submitted_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={exam.score >= 70 ? 'default' : 'secondary'}
                          className="mb-1"
                        >
                          {exam.correct}/{exam.total}
                        </Badge>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {formatDuration(exam.duration_sec)}
                        </p>
                      </div>
                      <Link to={`/practice/result/${exam.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          Xem lại
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* C) Most Practiced Set */}
            {stats.mostPracticedSet && (
              <div className="p-4 rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm">Bộ đề luyện nhiều nhất</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {stats.mostPracticedSet.title}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {stats.mostPracticedSet.attempt_count} lượt
                  </Badge>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
