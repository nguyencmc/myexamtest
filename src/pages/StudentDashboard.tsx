import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { AITutorButton } from '@/components/ai/AITutorButton';
import { useAchievements } from '@/hooks/useAchievements';
import { useDueCards } from '@/features/flashcards/hooks/useDueCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { DashboardSidebar, DashboardView } from '@/components/dashboard/DashboardSidebar';
import { DashboardMainContent } from '@/components/dashboard/DashboardMainContent';
import { DashboardRecommendations } from '@/components/dashboard/DashboardRecommendations';
import { 
  DashboardMyCoursesView,
  DashboardFlashcardsView,
  DashboardHistoryView,
  DashboardAchievementsView,
  DashboardSettingsView 
} from '@/components/dashboard/views';
import { BookOpen, Menu, X } from 'lucide-react';

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

// Placeholder views for external navigation
const PlaceholderView = ({ title, linkTo, linkText }: { title: string; linkTo: string; linkText: string }) => {
  const navigate = useNavigate();
  return (
    <div className="p-6 h-full flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <Button onClick={() => navigate(linkTo)}>{linkText}</Button>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { checkAndAwardAchievements, getUserProgress } = useAchievements();
  const isMobile = useIsMobile();
  
  const [activeView, setActiveView] = useState<DashboardView>('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalExamsTaken: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    points: 0,
    level: 1,
    flashcardsLearned: 0,
  });
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dueCount: flashcardDueCount } = useDueCards();

  useEffect(() => {
    if (user) {
      fetchData();
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

    const { count: flashcardsCount } = await supabase
      .from('user_flashcard_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('is_remembered', true);

    setStats(prev => ({
      ...prev,
      flashcardsLearned: flashcardsCount || 0,
    }));

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

    setLoading(false);
  };

  const pointsToNextLevel = (stats.level * 100) - (stats.points % 100);

  // Render main content based on active view
  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardMainContent
            stats={stats}
            weeklyProgress={weeklyProgress}
            flashcardDueCount={flashcardDueCount}
          />
        );
      case 'my-courses':
        return <DashboardMyCoursesView />;
      case 'flashcards':
        return <DashboardFlashcardsView />;
      case 'history':
        return <DashboardHistoryView />;
      case 'achievements':
        return <DashboardAchievementsView />;
      case 'wishlist':
        return <DashboardMyCoursesView />;
      case 'study-groups':
        return <PlaceholderView title="Nhóm học tập" linkTo="/study-groups" linkText="Xem nhóm học tập" />;
      case 'leaderboard':
        return <PlaceholderView title="Bảng xếp hạng" linkTo="/leaderboard" linkText="Xem bảng xếp hạng" />;
      case 'profile':
        return <PlaceholderView title="Hồ sơ cá nhân" linkTo="/profile" linkText="Xem hồ sơ" />;
      case 'settings':
        return <DashboardSettingsView />;
      default:
        return (
          <DashboardMainContent
            stats={stats}
            weeklyProgress={weeklyProgress}
            flashcardDueCount={flashcardDueCount}
          />
        );
    }
  };

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
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="gap-2"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            Menu
          </Button>
          <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
        </div>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <div 
              className="absolute left-0 top-0 h-full w-64 bg-background shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <DashboardSidebar 
                flashcardDueCount={flashcardDueCount}
                activeView={activeView}
                onViewChange={(view) => {
                  setActiveView(view);
                  setSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {renderMainContent()}
        </div>

        {activeView === 'dashboard' && (
          <div className="p-4 border-t border-border/50">
            <DashboardRecommendations
              streak={streak}
              level={stats.level}
              points={stats.points}
              pointsToNextLevel={pointsToNextLevel}
            />
          </div>
        )}
        
        <AITutorButton />
      </div>
    );
  }

  // Desktop 3-Column Layout (2/6/4 ratio)
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - 2 parts */}
        <div className="w-[16.67%] min-w-[200px] max-w-[240px] flex-shrink-0 hidden lg:block">
          <DashboardSidebar 
            flashcardDueCount={flashcardDueCount}
            activeView={activeView}
            onViewChange={setActiveView}
          />
        </div>
        
        {/* Main Content - 6 parts */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {renderMainContent()}
        </div>
        
        {/* Right Sidebar - 4 parts (only show on dashboard view) */}
        {activeView === 'dashboard' && (
          <div className="w-[33.33%] min-w-[300px] max-w-[400px] flex-shrink-0 hidden xl:block">
            <DashboardRecommendations
              streak={streak}
              level={stats.level}
              points={stats.points}
              pointsToNextLevel={pointsToNextLevel}
            />
          </div>
        )}
      </div>
      
      <AITutorButton />
    </div>
  );
};

export default StudentDashboard;
