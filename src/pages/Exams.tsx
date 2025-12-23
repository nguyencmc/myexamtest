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

// Default category icons mapping - will use icon_url from DB if available
const categoryIcons: Record<string, string> = {
  aws: "/themes/tailwind/images/categories/aws.png",
  toeic: "/themes/tailwind/images/categories/united-states.png",
  ielts: "/themes/tailwind/images/categories/england.png",
  tester: "/themes/tailwind/images/categories/tester.png",
  hsk: "/themes/tailwind/images/categories/china.png",
  jlpt: "/themes/tailwind/images/categories/japan.png",
  topik: "/themes/tailwind/images/categories/korea.png",
  ba: "/themes/tailwind/images/categories/ba.png",
  pmp: "/themes/tailwind/images/categories/pmp.png",
};

const categoryEmojis: Record<string, string> = {
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

const Exams = () => {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("attempts-desc");
  const [publisher, setPublisher] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchCategories();
  }, [sortBy]);

  const fetchCategories = async () => {
    setLoading(true);
    let query = supabase.from("exam_categories").select("*");

    // Sort based on selected option
    if (sortBy === "attempts-desc") {
      query = query.order("attempt_count", { ascending: false });
    } else if (sortBy === "attempts-asc") {
      query = query.order("attempt_count", { ascending: true });
    } else if (sortBy === "exams-desc") {
      query = query.order("exam_count", { ascending: false });
    } else if (sortBy === "exams-asc") {
      query = query.order("exam_count", { ascending: true });
    } else if (sortBy === "rating-desc") {
      query = query.order("rating", { ascending: false });
    } else if (sortBy === "rating-asc") {
      query = query.order("rating", { ascending: true });
    } else if (sortBy === "featured") {
      query = query.order("is_featured", { ascending: false });
    } else if (sortBy === "name-asc") {
      query = query.order("name", { ascending: true });
    } else if (sortBy === "name-desc") {
      query = query.order("name", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const filteredCategories = categories
    .filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((cat) => {
      if (categoryFilter === "with-subcategories") {
        return (cat.subcategory_count || 0) > 0;
      } else if (categoryFilter === "without-subcategories") {
        return (cat.subcategory_count || 0) === 0;
      }
      return true;
    });

  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  };

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("attempts-desc");
    setPublisher("all");
    setCategoryFilter("all");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-card rounded-xl p-5 mb-8 border border-gray-200 dark:border-border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-gray-900 dark:text-foreground">Filter and Sort</h3>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 bg-white dark:bg-background border-gray-200 dark:border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attempts-desc">Most Attempts</SelectItem>
                <SelectItem value="attempts-asc">Least Attempts</SelectItem>
                <SelectItem value="exams-desc">Most Exams</SelectItem>
                <SelectItem value="exams-asc">Least Exams</SelectItem>
                <SelectItem value="rating-desc">Highest Rating</SelectItem>
                <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={publisher} onValueChange={setPublisher}>
              <SelectTrigger className="w-40 bg-white dark:bg-background border-gray-200 dark:border-border">
                <SelectValue placeholder="Publisher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">The Best Study</SelectItem>
                <SelectItem value="community">End Users</SelectItem>
                <SelectItem value="official">All Publishers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44 bg-white dark:bg-background border-gray-200 dark:border-border">
                <SelectValue placeholder="Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="with-subcategories">With Subcategories</SelectItem>
                <SelectItem value="without-subcategories">Without Subcategories</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={handleReset} 
              className="gap-2 border-gray-200 dark:border-border hover:bg-gray-100 dark:hover:bg-muted"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-card rounded-xl overflow-hidden animate-pulse shadow-sm"
              >
                <div className="h-36 bg-gradient-to-br from-violet-400 to-purple-500"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-muted-foreground text-lg">
              No categories found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                to={`/exams/${category.slug}`}
                className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-border block"
              >
                {/* Category Header with Purple Gradient */}
                <div className="h-36 bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 relative flex items-center justify-center">
                  {/* Exam Count Badge */}
                  <div className="absolute top-3 right-3 bg-white/25 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-white" />
                    <span className="text-white font-semibold text-sm">
                      {category.exam_count || 0}
                    </span>
                  </div>

                  {/* Category Icon */}
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    {category.icon_url ? (
                      <img 
                        src={category.icon_url} 
                        alt={category.name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <span className="text-5xl">
                        {categoryEmojis[category.slug] || "📚"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-4">
                  <h3 className="font-bold text-base text-gray-900 dark:text-foreground mb-2 group-hover:text-violet-600 dark:group-hover:text-primary transition-colors line-clamp-1">
                    {category.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(category.rating || 5)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 dark:text-muted-foreground ml-1.5">
                      {category.rating || 5}/5
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-muted-foreground">
                      <Users className="w-4 h-4 text-violet-500" />
                      <span>
                        <strong className="text-gray-900 dark:text-foreground">
                          {formatNumber(category.attempt_count)}
                        </strong>
                        <span className="ml-1">attempts</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-muted-foreground">
                      <HelpCircle className="w-4 h-4 text-blue-500" />
                      <span>
                        <strong className="text-gray-900 dark:text-foreground">
                          {formatNumber(category.question_count)}
                        </strong>
                        <span className="ml-1">questions</span>
                      </span>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-wide">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Subcategories</span>
                    </div>
                    <span className="bg-violet-100 dark:bg-primary/20 text-violet-700 dark:text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                      {category.subcategory_count || 0}
                    </span>
                  </div>
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
