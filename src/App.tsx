import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import Exams from "./pages/Exams";
import Flashcards from "./pages/Flashcards";
import Podcasts from "./pages/Podcasts";
import PodcastDetail from "./pages/PodcastDetail";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import ExamCategoryDetail from "./pages/ExamCategoryDetail";
import ExamDetail from "./pages/ExamDetail";
import ExamTaking from "./pages/ExamTaking";
import ExamHistory from "./pages/ExamHistory";
import AttemptDetail from "./pages/AttemptDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/podcasts" element={<Podcasts />} />
            <Route path="/podcast/:slug" element={<PodcastDetail />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/books" element={<Books />} />
            <Route path="/book/:slug" element={<BookDetail />} />
            <Route path="/exam/:slug" element={<ExamDetail />} />
            <Route path="/exam/:slug/take" element={<ExamTaking />} />
            <Route path="/history" element={<ExamHistory />} />
            <Route path="/history/:attemptId" element={<AttemptDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
