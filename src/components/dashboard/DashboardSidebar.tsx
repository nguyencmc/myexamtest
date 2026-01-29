import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import {
  BarChart3,
  FileText,
  Layers,
  GraduationCap,
  Headphones,
  BookOpen,
  Trophy,
  Target,
  History,
  Settings,
  Users,
  ShieldCheck,
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
  const { isAdmin, isTeacher } = useUserRole();

  const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { title: 'Đề thi', href: '/exams', icon: FileText },
    { title: 'Luyện tập', href: '/practice', icon: Target },
    { title: 'Flashcards', href: '/flashcards', icon: Layers, badge: flashcardDueCount },
    { title: 'Khóa học', href: '/my-courses', icon: GraduationCap },
    { title: 'Podcasts', href: '/podcasts', icon: Headphones },
    { title: 'Sách', href: '/books', icon: BookOpen },
  ];

  const secondaryNavItems: NavItem[] = [
    { title: 'Thành tích', href: '/achievements', icon: Trophy },
    { title: 'Lịch sử', href: '/history', icon: History },
    { title: 'Nhóm học', href: '/study-groups', icon: Users },
    { title: 'Cài đặt', href: '/settings', icon: Settings },
  ];

  const adminNavItems: NavItem[] = [
    ...(isAdmin ? [{ title: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
    ...(isTeacher && !isAdmin ? [{ title: 'Teacher', href: '/teacher', icon: GraduationCap }] : []),
  ];

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    
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

  return (
    <aside className="w-full h-full bg-card border-r border-border/50 p-4 space-y-6">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2 px-3 pb-4 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground">Học tập</span>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Menu chính
        </p>
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Secondary Navigation */}
      <nav className="space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Khác
        </p>
        {secondaryNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Admin/Teacher Links */}
      {adminNavItems.length > 0 && (
        <nav className="space-y-1 pt-4 border-t border-border/50">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Quản trị
          </p>
          {adminNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      )}
    </aside>
  );
};
