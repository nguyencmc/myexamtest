import { Button } from "@/components/ui/button";
import { Play, Sparkles, Users, BookOpen, Award, TrendingUp } from "lucide-react";
import heroLaptop from "@/assets/hero-laptop.png";
import { Link } from "react-router-dom";

const stats = [
  { icon: Users, value: "10,000+", label: "Học viên" },
  { icon: BookOpen, value: "500+", label: "Đề thi" },
  { icon: Award, value: "95%", label: "Đạt điểm cao" },
  { icon: TrendingUp, value: "4.9/5", label: "Đánh giá" },
];

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background pt-8 pb-32 lg:pt-16 lg:pb-48">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 -left-20 w-60 h-60 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 right-1/4 w-40 h-40 bg-primary/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-xl animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Nền tảng #1 về luyện thi với AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-gradient">Luyện thi</span>
              <br />
              <span className="text-foreground">Thông minh với</span>
              <br />
              <span className="relative">
                <span className="text-foreground">AI!</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0 6 Q 25 0, 50 6 T 100 6" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              AI-Exam.cloud – Nền tảng luyện thi trực tuyến thông minh! Cung cấp đề thi đa dạng, flashcard tương tác, podcast học tập và nhiều công cụ học tập hiệu quả với sự hỗ trợ của AI.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/auth">
                <Button size="lg" className="shadow-button gap-2 text-base group">
                  <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Bắt đầu ngay
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-base group">
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Xem video
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="text-center p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors"
                  style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                >
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Laptop Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative z-10 animate-float">
              <img
                src={heroLaptop}
                alt="The Best Study Platform"
                className="w-full max-w-2xl mx-auto drop-shadow-2xl"
                width={1024}
                height={768}
                fetchPriority="high"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Wave SVG */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80C240 160 480 200 720 180C960 160 1200 80 1440 100V200H0V80Z"
            fill="hsl(var(--primary))"
          />
        </svg>
      </div>
    </section>
  );
};
