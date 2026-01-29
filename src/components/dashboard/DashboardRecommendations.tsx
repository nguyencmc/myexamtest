import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AchievementsBadgeDisplay } from '@/components/achievements/AchievementsBadgeDisplay';
import { SmartRecommendations } from '@/components/ai/SmartRecommendations';
import {
  Lightbulb,
  Flame,
  Star,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';

interface DashboardRecommendationsProps {
  streak: number;
  level: number;
  points: number;
  pointsToNextLevel: number;
}

export const DashboardRecommendations = ({
  streak,
  level,
  points,
  pointsToNextLevel,
}: DashboardRecommendationsProps) => {
  return (
    <aside className="w-full h-full bg-card border-l border-border/50 p-4 space-y-4 overflow-y-auto">
      {/* Quick Stats */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="font-bold text-foreground">{streak} ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="font-bold text-foreground">{level}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{points} điểm</span>
              <span className="text-primary font-medium">+{pointsToNextLevel} → Lv.{level + 1}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((points % 100) / 100) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="border-border/50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Gợi ý học tập
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <SmartRecommendations />
        </CardContent>
      </Card>

      {/* Achievements */}
      <Link to="/achievements" className="block">
        <AchievementsBadgeDisplay />
      </Link>

      {/* Quick Tips */}
      <Card className="border-border/50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-blue-500" />
            Mẹo nhanh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <p>Học 15 phút mỗi ngày tốt hơn 2 giờ cuối tuần</p>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <p>Ôn lại câu sai giúp ghi nhớ lâu hơn 40%</p>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-1">Bắt đầu học ngay!</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Hoàn thành mục tiêu hôm nay để giữ streak
          </p>
          <Link to="/practice">
            <Button size="sm" className="w-full">
              Luyện tập ngay
            </Button>
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
};
