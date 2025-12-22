import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Star, 
  Users, 
  HelpCircle, 
  Layers, 
  Filter, 
  RotateCcw,
  FileText
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExamCategory {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  exam_count: number | null;
  attempt_count: number | null;
  question_count: number | null;
  subcategory_count: number | null;
  rating: number | null;
  is_featured: boolean | null;
}

const categoryIcons: Record<string, string> = {
  aws: "🔶",
  toeic: "🇺🇸",
  ielts: "🇬🇧",
  tester: "✅",
  hsk: "🇨🇳",
  jlpt: "🇯🇵",
  topik: "🇰🇷",
  ba: "📊",
  pmp: "📋",
  comptia: "💻",
  cisco: "🌐",
  azure: "☁️",
};

const categoryColors: Record<string, string> = {
  aws: "from-orange-400 to-orange-600",
  toeic: "from-blue-400 to-blue-600",
  ielts: "from-red-400 to-red-600",
  tester: "from-green-400 to-green-600",
  hsk: "from-red-500 to-red-700",
  jlpt: "from-rose-400 to-rose-600",
  topik: "from-sky-400 to-sky-600",
  ba: "from-purple-400 to-purple-600",
  pmp: "from-indigo-400 to-indigo-600",
  comptia: "from-teal-400 to-teal-600",
  cisco: "from-cyan-400 to-cyan-600",
  azure: "from-blue-500 to-blue-700",
};

const Exams = () => {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("attempts");
  const [publisher, setPublisher] = useState("all");

  useEffect(() => {
    fetchCategories();
  }, [sortBy]);

  const fetchCategories = async () => {
    setLoading(true);
    let query = supabase.from("exam_categories").select("*");

    if (sortBy === "attempts") {
      query = query.order("attempt_count", { ascending: false });
    } else if (sortBy === "exams") {
      query = query.order("exam_count", { ascending: false });
    } else if (sortBy === "rating") {
      query = query.order("rating", { ascending: false });
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toLocaleString();
  };

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("attempts");
    setPublisher("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-2xl border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-card rounded-2xl p-6 mb-8 border border-border/50 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Bộ lọc và Sắp xếp</h3>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attempts">Nhiều lượt thi nhất</SelectItem>
                <SelectItem value="exams">Nhiều đề thi nhất</SelectItem>
                <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                <SelectItem value="name">Tên (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={publisher} onValueChange={setPublisher}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Nhà xuất bản" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="official">The Best Study</SelectItem>
                <SelectItem value="community">Cộng đồng</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Đặt lại
            </Button>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-40 bg-muted"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              Không tìm thấy danh mục nào
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                to={`/exams/${category.slug}`}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group border border-border/50 block"
              >
                {/* Category Header with Gradient */}
                <div
                  className={`h-40 bg-gradient-to-br ${
                    categoryColors[category.slug] || "from-primary to-accent"
                  } relative flex items-center justify-center`}
                >
                  {/* Exam Count Badge */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold">
                      {category.exam_count || 0}
                    </span>
                  </div>

                  {/* Category Icon */}
                  <div className="text-6xl">
                    {categoryIcons[category.slug] || "📚"}
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(category.rating || 5)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      {category.rating || 5}/5
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>
                        <strong className="text-foreground">
                          {formatNumber(category.attempt_count)}
                        </strong>{" "}
                        lượt thi
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-accent" />
                      <span>
                        <strong className="text-foreground">
                          {formatNumber(category.question_count)}
                        </strong>{" "}
                        câu hỏi
                      </span>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {category.subcategory_count && category.subcategory_count > 0 && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Layers className="w-4 h-4" />
                        <span>Danh mục con</span>
                      </div>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                        {category.subcategory_count}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <FloatingActions />
      <Footer />
    </div>
  );
};

export default Exams;
