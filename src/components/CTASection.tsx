import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "Truy cập không giới hạn",
  "AI hỗ trợ 24/7",
  "Cộng đồng học tập",
  "Chứng chỉ hoàn thành",
];

export const CTASection = () => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background Wave */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
      
      {/* Animated Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
            <span className="text-sm font-medium text-white">Hoàn toàn miễn phí • Không cần thẻ tín dụng</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu hành trình<br />
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              học tập thông minh?
            </span>
          </h2>
          
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Tham gia cùng hàng nghìn học viên đang cải thiện kỹ năng mỗi ngày với AI-Exam.cloud.
          </p>

          {/* Benefits list */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-white/90 text-sm">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2 text-base font-semibold group transition-all hover:scale-105"
              >
                Đăng ký miễn phí
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/exams">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white bg-transparent hover:bg-white/10 text-base font-semibold transition-all hover:scale-105"
              >
                Khám phá tính năng
              </Button>
            </Link>
          </div>
          
          {/* Trust badges */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm mb-4">Được tin dùng bởi học viên từ</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <span className="text-white font-semibold">🎓 ĐH Bách Khoa</span>
              <span className="text-white font-semibold">🎓 ĐH Ngoại Thương</span>
              <span className="text-white font-semibold">🎓 ĐH Kinh Tế</span>
              <span className="text-white font-semibold">🎓 ĐH FPT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
