import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Hải Đinh",
    role: "Học viên IELTS",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content: "Mình rất thích học tiếng Anh trên AI-Exam.cloud. Các bài học như flashcard, game từ vựng, bài thi thử… rất hữu ích và dễ tiếp cận. Nhờ website mà việc học trở nên thú vị và hiệu quả hơn!",
    rating: 5,
    improvement: "Điểm IELTS tăng từ 5.5 lên 7.0",
  },
  {
    name: "Trần Thị Bảo Châu",
    role: "Sinh viên Đại học",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    content: "AI-Exam.cloud quả thực là một website tuyệt vời! Tôi đã học được rất nhiều điều bổ ích và thú vị tại đây. Tính năng AI hỗ trợ giải thích đáp án rất chi tiết và dễ hiểu.",
    rating: 5,
    improvement: "Đạt 900+ điểm TOEIC",
  },
  {
    name: "Nguyễn Văn Minh",
    role: "Nhân viên văn phòng",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "Giao diện đẹp, dễ sử dụng. Các trò chơi từ vựng rất hay và giúp mình nhớ từ lâu hơn. Đặc biệt là tính năng lặp lại ngắt quãng rất hiệu quả!",
    rating: 5,
    improvement: "Học 50+ từ mới mỗi tuần",
  },
  {
    name: "Lê Thị Thu Hà",
    role: "Giáo viên Tiếng Anh",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "Tôi sử dụng AI-Exam.cloud để tạo bài thi cho học sinh. Tính năng AI tạo câu hỏi tự động giúp tôi tiết kiệm rất nhiều thời gian soạn đề.",
    rating: 5,
    improvement: "Tiết kiệm 10+ giờ/tuần",
  },
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4 text-sm font-medium">
            <Star className="h-4 w-4 fill-accent" />
            <span>Được yêu thích bởi 10,000+ học viên</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Cảm nhận của học viên
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-Exam.cloud luôn lắng nghe và không ngừng cải thiện để mang đến cho bạn trải nghiệm học tập tốt nhất.
          </p>
        </div>

        {/* Desktop view - Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="relative bg-card border border-border/50 shadow-card card-hover overflow-hidden group"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4 group-hover:text-primary/30 transition-colors" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-4">
                  "{testimonial.content}"
                </p>
                
                {/* Improvement badge */}
                <div className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-2 py-1 rounded-full mb-4">
                  ✨ {testimonial.improvement}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile view - Carousel */}
        <div className="md:hidden relative">
          <Card className="bg-card border border-border/50 shadow-card overflow-hidden">
            <CardContent className="p-6">
              <Quote className="h-10 w-10 text-primary/20 absolute top-4 right-4" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-4 italic min-h-[100px]">
                "{testimonials[currentIndex].content}"
              </p>
              
              <div className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-2 py-1 rounded-full mb-4">
                ✨ {testimonials[currentIndex].improvement}
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={testimonials[currentIndex].avatar} alt={testimonials[currentIndex].name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {testimonials[currentIndex].name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonials[currentIndex].name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonials[currentIndex].role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlay(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
