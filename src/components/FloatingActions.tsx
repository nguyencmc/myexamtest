import { useState } from "react";
import { 
  MessageSquare, 
  Mic, 
  Gift, 
  FileText, 
  BookOpen, 
  Book, 
  Bot, 
  PenTool, 
  BookMarked,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

const actions = [
  { icon: Mic, label: "AI Talk", color: "bg-blue-500 hover:bg-blue-600", href: "#" },
  { icon: MessageSquare, label: "Free Talk", color: "bg-teal-500 hover:bg-teal-600", href: "#" },
  { icon: Gift, label: "Quà tặng", color: "bg-orange-500 hover:bg-orange-600", href: "#" },
  { icon: FileText, label: "Bài thi", color: "bg-red-500 hover:bg-red-600", href: "/exams" },
  { icon: BookOpen, label: "Khóa học", color: "bg-indigo-500 hover:bg-indigo-600", href: "/courses" },
  { icon: Book, label: "Sách", color: "bg-green-500 hover:bg-green-600", href: "/books" },
  { icon: Bot, label: "Hỏi AI", color: "bg-purple-500 hover:bg-purple-600", href: "#" },
  { icon: PenTool, label: "Luyện tập", color: "bg-pink-500 hover:bg-pink-600", href: "/practice" },
  { icon: BookMarked, label: "Flashcards", color: "bg-amber-500 hover:bg-amber-600", href: "/flashcards" },
];

export const FloatingActions = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex items-center">
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-primary text-primary-foreground p-2 rounded-l-lg shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
          aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
        >
          {isExpanded ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Actions Panel */}
        <div
          className={`bg-card/95 backdrop-blur-sm border border-border shadow-lg rounded-l-2xl overflow-hidden transition-all duration-300 ${
            isExpanded ? "w-20 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="p-2 flex flex-col gap-2">
            {actions.map((action, index) => (
              <Tooltip key={action.label} delayDuration={100}>
                <TooltipTrigger asChild>
                  <Link to={action.href}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`w-14 h-14 rounded-xl ${action.color} text-white flex-col gap-1 transition-all hover:scale-105 hover:shadow-lg`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium">{action.label}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left" className="font-medium">
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Floating Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          size="icon"
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            showMobileMenu ? 'bg-destructive rotate-45' : 'bg-primary'
          }`}
        >
          {showMobileMenu ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </Button>
        
        {/* Mobile Actions Menu */}
        <div className={`absolute bottom-16 right-0 transition-all duration-300 ${
          showMobileMenu ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-xl p-3 grid grid-cols-3 gap-2 min-w-[240px]">
            {actions.map((action, index) => (
              <Link
                key={action.label}
                to={action.href}
                onClick={() => setShowMobileMenu(false)}
                className={`${action.color} text-white p-3 rounded-xl flex flex-col items-center gap-1 transition-all hover:scale-105`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
