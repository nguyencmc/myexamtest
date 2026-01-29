import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PracticeTodayWidget } from '@/components/dashboard/PracticeTodayWidget';
import { PracticeStatsWidget } from '@/components/dashboard/PracticeStatsWidget';
import {
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Layers,
  GraduationCap,
  Headphones,
} from 'lucide-react';

interface Stats {
  totalExamsTaken: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  points: number;
  level: number;
  flashcardsLearned: number;
}

interface WeeklyProgress {
  day: string;
  attempts: number;
  correct: number;
}

interface DashboardMainContentProps {
  stats: Stats;
  weeklyProgress: WeeklyProgress[];
  flashcardDueCount: number;
}

export const DashboardMainContent = ({
  stats,
  weeklyProgress,
  flashcardDueCount,
}: DashboardMainContentProps) => {
  const accuracy = stats.totalQuestionsAnswered > 0 
    ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100) 
    : 0;

  const pointsToNextLevel = (stats.level * 100) - (stats.points % 100);
  const levelProgress = ((stats.points % 100) / 100) * 100;

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Tổng điểm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link to="/history" className="block">
          <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalExamsTaken}</p>
                  <p className="text-xs text-muted-foreground">Đề đã làm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Độ chính xác</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link to={flashcardDueCount > 0 ? "/flashcards/today" : "/flashcards"} className="block">
          <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full relative">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.flashcardsLearned}</p>
                  <p className="text-xs text-muted-foreground">Flashcards</p>
                </div>
              </div>
              {flashcardDueCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {flashcardDueCount}
                </span>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Practice Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PracticeTodayWidget />
        <PracticeStatsWidget />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Level Progress */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
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

        {/* Performance Summary */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5" />
              Thống kê chi tiết
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tổng câu hỏi</span>
              <span className="font-semibold">{stats.totalQuestionsAnswered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Trả lời đúng
              </span>
              <span className="font-semibold text-green-600">{stats.totalCorrectAnswers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                Trả lời sai
              </span>
              <span className="font-semibold text-red-600">
                {stats.totalQuestionsAnswered - stats.totalCorrectAnswers}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tỷ lệ đúng</span>
                <span className="font-bold text-primary">{accuracy}%</span>
              </div>
              <Progress value={accuracy} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5" />
            Hoạt động trong tuần
          </CardTitle>
          <CardDescription>Số lượt làm bài theo ngày</CardDescription>
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
                      className={`w-full max-w-10 rounded-t-md transition-all ${
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/exams">
          <Card className="cursor-pointer hover:shadow-lg transition-all border-border/50 group h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Đề thi</h3>
                <p className="text-xs text-muted-foreground">Làm đề ngay</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/flashcards">
          <Card className="cursor-pointer hover:shadow-lg transition-all border-border/50 group h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <Layers className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Flashcards</h3>
                <p className="text-xs text-muted-foreground">Học từ vựng</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/my-courses">
          <Card className="cursor-pointer hover:shadow-lg transition-all border-border/50 group h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <GraduationCap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Khóa học</h3>
                <p className="text-xs text-muted-foreground">Học online</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/podcasts">
          <Card className="cursor-pointer hover:shadow-lg transition-all border-border/50 group h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <Headphones className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Podcasts</h3>
                <p className="text-xs text-muted-foreground">Luyện nghe</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
