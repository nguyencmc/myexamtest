import { useState } from "react";
import { 
  Facebook, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Send,
  Instagram,
  Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const footerLinks = {
  features: [
    { name: "Thẻ ghi nhớ", href: "/flashcards" },
    { name: "Luyện tập", href: "/practice" },
    { name: "Đề thi", href: "/exams" },
    { name: "Podcasts", href: "/podcasts" },
    { name: "Khóa học", href: "/courses" },
  ],
  support: [
    { name: "Hướng dẫn sử dụng", href: "#" },
    { name: "Câu hỏi thường gặp", href: "#" },
    { name: "Liên hệ hỗ trợ", href: "#" },
    { name: "Báo lỗi", href: "#" },
  ],
  legal: [
    { name: "Điều khoản sử dụng", href: "#" },
    { name: "Chính sách bảo mật", href: "#" },
    { name: "Quyền riêng tư", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-blue-600" },
  { icon: Youtube, href: "#", label: "Youtube", color: "hover:bg-red-600" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-600" },
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500" },
];

export const Footer = () => {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <footer className="bg-foreground text-background/90">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-background mb-3">
              Đăng ký nhận tin tức mới nhất
            </h3>
            <p className="text-background/60 mb-6">
              Nhận thông báo về các đề thi mới, tính năng hữu ích và tips học tập hiệu quả
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-primary"
              />
              <Button type="submit" className="gap-2 whitespace-nowrap">
                <Send className="h-4 w-4" />
                Đăng ký
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="mb-6 flex items-center gap-2 w-fit">
              <img src={logo} alt="AI-Exam.cloud" className="h-10 w-auto" width={40} height={40} />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Exam.cloud
              </span>
            </Link>
            <p className="text-background/70 mb-6 leading-relaxed max-w-sm">
              Nền tảng luyện thi trực tuyến thông minh với AI, giúp việc học trở nên thú vị và hiệu quả hơn. Đồng hành cùng bạn trên con đường chinh phục mọi kỳ thi.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`w-10 h-10 rounded-full bg-background/10 flex items-center justify-center ${social.color} transition-all duration-300 hover:scale-110`}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-background">Tính năng</h3>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-background">Hỗ trợ</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-background">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-background/70">Việt Nam</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+84123456789" className="text-background/70 hover:text-primary transition-colors">
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:support@ai-exam.cloud" className="text-background/70 hover:text-primary transition-colors">
                  support@ai-exam.cloud
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © {currentYear} AI-Exam.cloud. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-background/60 text-sm hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <p className="text-background/60 text-sm flex items-center gap-1">
              Được tạo với <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" /> tại Việt Nam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
