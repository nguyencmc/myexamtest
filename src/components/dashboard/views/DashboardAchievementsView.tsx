import { AchievementsBadgeDisplay } from '@/components/achievements/AchievementsBadgeDisplay';
import { Trophy } from 'lucide-react';

export const DashboardAchievementsView = () => {
  return (
    <div className="p-4 sm:p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Thành tích</h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi tiến độ và thu thập huy hiệu
            </p>
          </div>
        </div>
      </div>

      <AchievementsBadgeDisplay showAll />
    </div>
  );
};
