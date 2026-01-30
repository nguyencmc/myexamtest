import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  GraduationCap,
  Layers,
  History,
  Trophy,
  Heart,
  Users,
  Settings,
  User,
  BookMarked,
  ArrowLeft,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface DashboardSidebarProps {
  flashcardDueCount?: number;
}

export const DashboardSidebar = ({ flashcardDueCount = 0 }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const myContentItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { title: 'Khóa học của tôi', href: '/my-courses', icon: GraduationCap },
    { title: 'Flashcards của tôi', href: '/flashcards', icon: Layers, badge: flashcardDueCount },
    { title: 'Lịch sử làm bài', href: '/history', icon: History },
    { title: 'Thành tích', href: '/achievements', icon: Trophy },
    { title: 'Yêu thích', href: '/my-courses?tab=wishlist', icon: Heart },
  ];

  const socialItems: NavItem[] = [
    { title: 'Nhóm học tập', href: '/study-groups', icon: Users },
    { title: 'Bảng xếp hạng', href: '/leaderboard', icon: BookMarked },
  ];

  const accountItems: NavItem[] = [
    { title: 'Hồ sơ cá nhân', href: '/profile', icon: User },
    { title: 'Cài đặt', href: '/settings', icon: Settings },
  ];

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href || 
      (item.href.includes('?') && location.pathname + location.search === item.href);
    
    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          "hover:bg-primary/10 hover:text-primary",
          isActive 
            ? "bg-primary/10 text-primary border-l-2 border-primary" 
            : "text-muted-foreground"
        )}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{item.title}</span>
        {item.badge && item.badge > 0 && (
          <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <aside className="w-full h-full bg-card border-r border-border/50 p-4 space-y-6 overflow-y-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại trang chủ
      </Button>

      {/* User Profile Card */}
      <div className="flex items-center gap-3 px-3 pb-4 border-b border-border/50">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {user?.email?.split('@')[0] || 'Người dùng'}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>

      {/* My Content */}
      <nav className="space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Nội dung của tôi
        </p>
        {myContentItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Social */}
      <nav className="space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Cộng đồng
        </p>
        {socialItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Account */}
      <nav className="space-y-1 pt-4 border-t border-border/50">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Tài khoản
        </p>
        {accountItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
};
