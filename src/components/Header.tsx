import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  { name: "Luyện thi", href: "#exams" },
  { name: "Podcasts", href: "#podcasts" },
  { name: "Khóa học", href: "#courses" },
  { name: "Sách", href: "#books" },
  { name: "Kỹ năng", href: "#skills", hasDropdown: true },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="relative">
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-foreground">The</span>
                <span className="text-primary"> Best</span>
              </span>
              <span className="block text-xl font-bold text-accent -mt-1">
                Study
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                {link.name}
                {link.hasDropdown && <ChevronDown className="h-4 w-4" />}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              Đăng nhập
            </Button>
            <Button className="shadow-button">
              Đăng ký
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="ghost" className="w-full justify-center">
                Đăng nhập
              </Button>
              <Button className="w-full shadow-button">
                Đăng ký
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
