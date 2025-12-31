import { Link } from "react-router-dom";
import { 
  FileText, 
  Layers, 
  Headphones, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Trophy,
  LayoutDashboard,
  User,
  History,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import logo from "@/assets/logo.png";

interface UserProfile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  level: number | null;
  points: number | null;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: UserProfile | null;
  displayName: string;
  isAdmin: boolean;
  isTeacher: boolean;
  onSignOut: () => void;
}

const mainNavLinks = [
  { name: "Luyện thi", href: "/exams", icon: FileText, description: "Bài kiểm tra & đề thi" },
  { name: "Flashcards", href: "/flashcards", icon: Layers, description: "Thẻ ghi nhớ" },
  { name: "Podcasts", href: "/podcasts", icon: Headphones, description: "Nghe và học" },
  { name: "Khóa học", href: "/courses", icon: GraduationCap, description: "Học theo lộ trình" },
  { name: "Sách", href: "/books", icon: BookOpen, description: "Tài liệu học tập" },
  { name: "Nhóm học tập", href: "/study-groups", icon: Users, description: "Học cùng bạn bè" },
  { name: "Bảng xếp hạng", href: "/leaderboard", icon: Trophy, description: "Top người học" },
];

const userMenuLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Xem hồ sơ", href: "/profile", icon: User, needsUsername: true },
  { name: "Thành tựu", href: "/achievements", icon: Trophy },
  { name: "Lịch sử làm bài", href: "/history", icon: History },
  { name: "Thiết lập", href: "/settings", icon: Settings },
];

export const MobileMenu = ({
  isOpen,
  onClose,
  user,
  profile,
  displayName,
  isAdmin,
  isTeacher,
  onSignOut,
}: MobileMenuProps) => {
  const getProfileLink = (link: typeof userMenuLinks[0]) => {
    if (link.needsUsername && profile?.username) {
      return `/@${profile.username}`;
    }
    return link.href;
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[90vh] rounded-t-3xl">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={onClose} className="flex items-center gap-2">
              <img src={logo} alt="AI-Exam.cloud" className="h-8 w-auto" />
              <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Exam.cloud
              </DrawerTitle>
            </Link>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4">
          {/* User Profile Card */}
          {user && profile && (
            <div className="mb-4">
              <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-2xl p-4 border border-primary/10">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{displayName}</h3>
                    {profile.username && (
                      <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Level {profile.level || 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        {(profile.points || 0).toLocaleString()} điểm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="space-y-1 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Học tập
            </p>
            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/80 active:bg-muted transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <link.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{link.name}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </Link>
            ))}
          </div>

          <Separator className="my-4" />

          {/* User Menu or Auth */}
          {user ? (
            <>
              <div className="space-y-1 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  Tài khoản
                </p>
                {userMenuLinks.map((link) => {
                  if (link.needsUsername && !profile?.username) return null;
                  return (
                    <Link
                      key={link.name}
                      to={getProfileLink(link)}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/80 active:bg-muted transition-colors"
                    >
                      <link.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Admin/Teacher Links */}
              {(isAdmin || isTeacher) && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      Quản trị
                    </p>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 active:bg-primary/15 transition-colors border border-primary/10"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-primary">Admin Dashboard</span>
                      </Link>
                    )}
                    {isTeacher && !isAdmin && (
                      <Link
                        to="/teacher"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-accent/5 hover:bg-accent/10 active:bg-accent/15 transition-colors border border-accent/10"
                      >
                        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-accent" />
                        </div>
                        <span className="font-semibold text-accent">Teacher Dashboard</span>
                      </Link>
                    )}
                  </div>
                </>
              )}

              <Separator className="my-4" />

              {/* Sign Out */}
              <Button
                variant="ghost"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="w-full justify-start gap-3 px-3 py-6 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </Button>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <Link to="/auth" onClick={onClose}>
                <Button className="w-full h-12 rounded-xl shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                  Đăng ký miễn phí
                </Button>
              </Link>
              <Link to="/auth" onClick={onClose}>
                <Button variant="outline" className="w-full h-12 rounded-xl">
                  Đăng nhập
                </Button>
              </Link>
            </div>
          )}

          {/* Bottom Spacing */}
          <div className="h-8" />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
