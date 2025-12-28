import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle,
  Edit,
  FolderOpen
} from 'lucide-react';
import { type Question } from './QuestionEditor';

interface ReviewStepProps {
  title: string;
  description: string;
  categoryName?: string;
  difficulty: string;
  durationMinutes: number;
  questions: Question[];
  onEditInfo: () => void;
  onEditQuestions: () => void;
}

export const ReviewStep = ({
  title,
  description,
  categoryName,
  difficulty,
  durationMinutes,
  questions,
  onEditInfo,
  onEditQuestions,
}: ReviewStepProps) => {
  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return { label: 'Dễ', color: 'bg-green-500' };
      case 'medium': return { label: 'Trung bình', color: 'bg-yellow-500' };
      case 'hard': return { label: 'Khó', color: 'bg-red-500' };
      default: return { label: diff, color: 'bg-gray-500' };
    }
  };

  const diffInfo = getDifficultyLabel(difficulty);
  
  const validQuestions = questions.filter(q => q.question_text && q.option_a && q.option_b);
  const hasIssues = validQuestions.length < questions.length || questions.length === 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-xs text-muted-foreground">Câu hỏi</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{durationMinutes}</p>
              <p className="text-xs text-muted-foreground">Phút</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${diffInfo.color}/10 flex items-center justify-center`}>
              <BarChart3 className={`w-5 h-5 ${diffInfo.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-lg font-bold">{diffInfo.label}</p>
              <p className="text-xs text-muted-foreground">Độ khó</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              hasIssues ? 'bg-yellow-500/10' : 'bg-green-500/10'
            }`}>
              {hasIssues ? (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold">{hasIssues ? 'Cần kiểm tra' : 'Sẵn sàng'}</p>
              <p className="text-xs text-muted-foreground">Trạng thái</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exam Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Thông tin đề thi</CardTitle>
            <CardDescription>Kiểm tra lại các thông tin cơ bản</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onEditInfo}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tiêu đề</p>
              <p className="font-medium">{title || '(Chưa nhập)'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Danh mục</p>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{categoryName || '(Chưa chọn)'}</p>
              </div>
            </div>
          </div>
          {description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mô tả</p>
              <p className="text-sm">{description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Danh sách câu hỏi</CardTitle>
            <CardDescription>
              {validQuestions.length} / {questions.length} câu hỏi hợp lệ
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onEditQuestions}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="font-medium">Chưa có câu hỏi nào</p>
              <p className="text-sm text-muted-foreground">
                Vui lòng thêm ít nhất 1 câu hỏi trước khi lưu
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const isValid = q.question_text && q.option_a && q.option_b;
                  const optionCount = [q.option_a, q.option_b, q.option_c, q.option_d, 
                    q.option_e, q.option_f, q.option_g, q.option_h].filter(Boolean).length;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border ${
                        isValid ? 'bg-muted/30 border-border' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant={isValid ? "secondary" : "outline"} className="shrink-0 mt-0.5">
                          {idx + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">
                            {q.question_text || '(Chưa nhập câu hỏi)'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{optionCount} đáp án</span>
                            <span>Đáp án đúng: {q.correct_answer}</span>
                            {q.question_image && (
                              <Badge variant="outline" className="text-xs">
                                Có ảnh
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isValid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
