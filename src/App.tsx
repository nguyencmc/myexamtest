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
import UserProfile from "./pages/UserProfile";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Admin & Teacher pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/admin/TeacherDashboard";
import ExamManagement from "./pages/admin/ExamManagement";
import ExamEditor from "./pages/admin/ExamEditor";
import FlashcardManagement from "./pages/admin/FlashcardManagement";
import FlashcardEditor from "./pages/admin/FlashcardEditor";
import PodcastManagement from "./pages/admin/PodcastManagement";
import PodcastEditor from "./pages/admin/PodcastEditor";
import CategoryManagement from "./pages/admin/CategoryManagement";
import StudentDashboard from "./pages/StudentDashboard";
import Achievements from "./pages/Achievements";
import StudyGroups from "./pages/StudyGroups";
import StudyGroupDetail from "./pages/StudyGroupDetail";

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
            <Route path="/exams/:slug" element={<ExamCategoryDetail />} />
            <Route path="/books" element={<Books />} />
            <Route path="/book/:slug" element={<BookDetail />} />
            <Route path="/exam/:slug" element={<ExamDetail />} />
            <Route path="/exam/:slug/take" element={<ExamTaking />} />
            <Route path="/history" element={<ExamHistory />} />
            <Route path="/history/:attemptId" element={<AttemptDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/study-groups" element={<StudyGroups />} />
            <Route path="/study-groups/:groupId" element={<StudyGroupDetail />} />
            <Route path="/@:username" element={<UserProfile />} />
            
            {/* Admin & Teacher routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/exams" element={<ExamManagement />} />
            <Route path="/admin/exams/create" element={<ExamEditor />} />
            <Route path="/admin/exams/:id" element={<ExamEditor />} />
            <Route path="/admin/flashcards" element={<FlashcardManagement />} />
            <Route path="/admin/flashcards/create" element={<FlashcardEditor />} />
            <Route path="/admin/flashcards/:id" element={<FlashcardEditor />} />
            <Route path="/admin/podcasts" element={<PodcastManagement />} />
            <Route path="/admin/podcasts/create" element={<PodcastEditor />} />
            <Route path="/admin/podcasts/:id" element={<PodcastEditor />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
