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
  Headphones, 
  Clock, 
  Filter, 
  RotateCcw,
  Mic,
  Play,
  TrendingUp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface PodcastCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  podcast_count: number | null;
  is_featured: boolean | null;
}

interface Podcast {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  episode_number: number | null;
  host_name: string | null;
  listen_count: number | null;
  is_featured: boolean | null;
  difficulty: string | null;
}

const categoryIcons: Record<string, string> = {
  "toeic-listening": "🎧",
  "ielts-listening": "🎯",
  "english-conversations": "💬",
  "business-english": "💼",
};

const categoryColors: Record<string, string> = {
  "toeic-listening": "from-blue-400 to-blue-600",
  "ielts-listening": "from-red-400 to-red-600",
  "english-conversations": "from-green-400 to-green-600",
  "business-english": "from-purple-400 to-purple-600",
};

const difficultyLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: "Cơ bản", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  intermediate: { label: "Trung bình", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  advanced: { label: "Nâng cao", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const Podcasts = () => {
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("listens");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"categories" | "podcasts">("categories");

  useEffect(() => {
    fetchData();
  }, [sortBy, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("podcast_categories")
      .select("*")
      .order("display_order", { ascending: true });
    
    setCategories(categoriesData || []);

    // Fetch podcasts
    let podcastQuery = supabase.from("podcasts").select("*");

    if (selectedCategory !== "all") {
      const category = categoriesData?.find(c => c.slug === selectedCategory);
      if (category) {
        podcastQuery = podcastQuery.eq("category_id", category.id);
      }
    }

    if (sortBy === "listens") {
      podcastQuery = podcastQuery.order("listen_count", { ascending: false });
    } else if (sortBy === "newest") {
      podcastQuery = podcastQuery.order("created_at", { ascending: false });
    } else if (sortBy === "duration") {
      podcastQuery = podcastQuery.order("duration_seconds", { ascending: false });
    } else if (sortBy === "episode") {
      podcastQuery = podcastQuery.order("episode_number", { ascending: true });
    }

    const { data: podcastsData } = await podcastQuery;
    setPodcasts(podcastsData || []);
    
    setLoading(false);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPodcasts = podcasts.filter((pod) =>
    pod.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("listens");
    setSelectedCategory("all");
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Podcasts
          </h1>
          <p className="text-muted-foreground">
            Luyện nghe tiếng Anh mọi lúc mọi nơi với các bài podcast chất lượng
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm podcast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-2xl border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={viewMode === "categories" ? "default" : "outline"}
            onClick={() => setViewMode("categories")}
            className="gap-2"
          >
            <Mic className="w-4 h-4" />
            Danh mục
          </Button>
          <Button
            variant={viewMode === "podcasts" ? "default" : "outline"}
            onClick={() => setViewMode("podcasts")}
            className="gap-2"
          >
            <Headphones className="w-4 h-4" />
            Tất cả Podcasts
          </Button>
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
                <SelectItem value="listens">Nhiều lượt nghe nhất</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="duration">Dài nhất</SelectItem>
                <SelectItem value="episode">Theo tập</SelectItem>
              </SelectContent>
            </Select>

            {viewMode === "podcasts" && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Đặt lại
            </Button>
          </div>
        </div>

        {/* Content */}
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
        ) : viewMode === "categories" ? (
          // Categories View
          filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <Mic className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                Không tìm thấy danh mục nào
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.slug);
                    setViewMode("podcasts");
                  }}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group border border-border/50"
                >
                  {/* Category Header with Gradient */}
                  <div
                    className={`h-40 bg-gradient-to-br ${
                      categoryColors[category.slug] || "from-primary to-accent"
                    } relative flex items-center justify-center`}
                  >
                    {/* Podcast Count Badge */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-white" />
                      <span className="text-white font-semibold">
                        {category.podcast_count || 0}
                      </span>
                    </div>

                    {category.is_featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-yellow-500 text-yellow-900">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Nổi bật
                        </Badge>
                      </div>
                    )}

                    {/* Category Icon */}
                    <div className="text-6xl">
                      {categoryIcons[category.slug] || "🎧"}
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {category.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Play className="w-4 h-4 text-primary" />
                      <span>
                        <strong className="text-foreground">
                          {category.podcast_count || 0}
                        </strong>{" "}
                        podcasts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Podcasts View
          filteredPodcasts.length === 0 ? (
            <div className="text-center py-16">
              <Headphones className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                Không tìm thấy podcast nào
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPodcasts.map((podcast) => (
                <Link
                  key={podcast.id}
                  to={`/podcast/${podcast.slug}`}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group border border-border/50 block"
                >
                  {/* Podcast Header */}
                  <div className="h-32 bg-gradient-to-br from-primary/80 to-accent/80 relative flex items-center justify-center">
                    {podcast.is_featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-yellow-500 text-yellow-900">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Hot
                        </Badge>
                      </div>
                    )}

                    <div className="absolute top-3 right-3">
                      <Badge className={difficultyLabels[podcast.difficulty || "intermediate"].color}>
                        {difficultyLabels[podcast.difficulty || "intermediate"].label}
                      </Badge>
                    </div>

                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  {/* Podcast Info */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Tập {podcast.episode_number}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getCategoryName(podcast.category_id)}
                      </span>
                    </div>

                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {podcast.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {podcast.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(podcast.duration_seconds)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Headphones className="w-4 h-4" />
                          <span>{formatNumber(podcast.listen_count)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                      Host: {podcast.host_name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </main>

      <FloatingActions />
      <Footer />
    </div>
  );
};

export default Podcasts;
