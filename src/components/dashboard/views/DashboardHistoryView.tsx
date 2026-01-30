import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Trophy,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  History,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ExamAttempt {
  id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent_seconds: number;
  completed_at: string;
  answers: Record<string, string>;
  exam?: {
    title: string;
    slug: string;
    difficulty: string;
  };
}

export const DashboardHistoryView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);

  const { data: attempts, isLoading } = useQuery({
    queryKey: ["exam-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("exam_attempts")
        .select(`
          *,
          exam:exams(title, slug, difficulty)
        `)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data as ExamAttempt[];
    },
    enabled: !!user?.id,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}p ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Dễ";
      case "medium":
        return "TB";
      case "hard":
        return "Khó";
      default:
        return difficulty;
    }
  };

  return (
    <div className="p-4 sm:p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Lịch sử làm bài</h1>
            <p className="text-sm text-muted-foreground">
              Xem lại các bài thi đã làm
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : attempts && attempts.length > 0 ? (
        <div className="space-y-3">
          {attempts.map((attempt) => (
            <Card
              key={attempt.id}
              className="hover:border-primary/50 transition-all cursor-pointer"
              onClick={() =>
                setSelectedAttempt(
                  selectedAttempt === attempt.id ? null : attempt.id
                )
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Score Circle */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getScoreBgColor(
                      attempt.score
                    )}`}
                  >
                    <span
                      className={`text-xl font-bold ${getScoreColor(
                        attempt.score
                      )}`}
                    >
                      {attempt.score}%
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {attempt.exam?.title || "Đề thi không tồn tại"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(
                          new Date(attempt.completed_at),
                          "dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(attempt.time_spent_seconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        {attempt.correct_answers}/{attempt.total_questions}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {attempt.exam?.difficulty && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${getDifficultyColor(attempt.exam.difficulty)}`}
                      >
                        {getDifficultyLabel(attempt.exam.difficulty)}
                      </Badge>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        selectedAttempt === attempt.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAttempt === attempt.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-primary">
                          {attempt.score}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Điểm
                        </div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-green-500">
                          {attempt.correct_answers}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Đúng
                        </div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-red-500">
                          {attempt.total_questions - attempt.correct_answers}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Sai
                        </div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">
                          {Math.floor(attempt.time_spent_seconds / 60)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Phút
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/history/${attempt.id}`);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                      {attempt.exam?.slug && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/exam/${attempt.exam?.slug}/take`);
                          }}
                        >
                          <Trophy className="w-4 h-4 mr-1" />
                          Làm lại
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Chưa có lịch sử làm bài</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Bắt đầu làm bài thi để theo dõi tiến độ
          </p>
          <Link to="/exams">
            <Button size="sm">Khám phá đề thi</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
