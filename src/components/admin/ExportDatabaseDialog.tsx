import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ExportCategory {
  id: string;
  label: string;
  tables: string[];
  description: string;
}

const EXPORT_CATEGORIES: ExportCategory[] = [
  {
    id: 'users',
    label: 'Người dùng & Hồ sơ',
    tables: ['profiles', 'user_achievements'],
    description: 'Thông tin người dùng và thành tích',
  },
  {
    id: 'rbac',
    label: 'Phân quyền (RBAC)',
    tables: ['user_roles', 'permissions', 'role_permissions'],
    description: 'Vai trò, quyền hạn và cấu hình phân quyền',
  },
  {
    id: 'exams',
    label: 'Đề thi & Câu hỏi',
    tables: ['exams', 'questions', 'exam_categories', 'exam_attempts'],
    description: 'Đề thi, câu hỏi và lịch sử làm bài',
  },
  {
    id: 'practice',
    label: 'Luyện tập',
    tables: ['practice_question_sets', 'practice_questions', 'practice_attempts', 'practice_exam_sessions'],
    description: 'Bộ câu hỏi luyện tập và kết quả',
  },
  {
    id: 'courses',
    label: 'Khóa học',
    tables: ['courses', 'course_categories', 'course_sections', 'course_lessons', 'course_tests', 'course_test_questions', 'course_reviews', 'course_questions', 'course_answers', 'course_certificates', 'user_course_enrollments', 'lesson_attachments', 'user_lesson_progress', 'course_wishlists'],
    description: 'Khóa học, bài học, bài kiểm tra và tiến độ',
  },
  {
    id: 'flashcards',
    label: 'Flashcard',
    tables: ['flashcard_sets', 'flashcards', 'flashcard_decks', 'flashcard_deck_cards', 'user_flashcard_progress'],
    description: 'Bộ thẻ ghi nhớ và tiến độ học',
  },
  {
    id: 'podcasts',
    label: 'Podcast',
    tables: ['podcasts', 'podcast_categories', 'podcast_bookmarks', 'user_podcast_progress'],
    description: 'Podcast và tiến độ nghe',
  },
  {
    id: 'books',
    label: 'Sách',
    tables: ['books', 'book_categories', 'book_chapters', 'book_bookmarks', 'book_highlights', 'book_notes', 'user_book_progress'],
    description: 'Sách, chương và ghi chú',
  },
  {
    id: 'achievements',
    label: 'Thành tích',
    tables: ['achievements'],
    description: 'Danh sách thành tích hệ thống',
  },
  {
    id: 'study_groups',
    label: 'Nhóm học tập',
    tables: ['study_groups', 'study_group_members', 'study_group_messages', 'study_group_resources'],
    description: 'Nhóm học tập và tin nhắn',
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    tables: ['audit_logs'],
    description: 'Nhật ký hoạt động hệ thống',
  },
];

export function ExportDatabaseDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === EXPORT_CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(EXPORT_CATEGORIES.map(c => c.id));
    }
  };

  const getSelectedTables = (): string[] => {
    const tables = new Set<string>();
    EXPORT_CATEGORIES
      .filter(cat => selectedCategories.includes(cat.id))
      .forEach(cat => cat.tables.forEach(t => tables.add(t)));
    return Array.from(tables);
  };

  const handleExport = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "Chưa chọn mục nào",
        description: "Vui lòng chọn ít nhất một mục để xuất",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const tables = getSelectedTables();
      
      const response = await supabase.functions.invoke('export-database', {
        body: { tables },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const jsonData = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${selectedCategories.join('-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Thành công",
        description: `Đã xuất ${tables.length} bảng dữ liệu`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất database",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const allSelected = selectedCategories.length === EXPORT_CATEGORIES.length;
  const someSelected = selectedCategories.length > 0 && !allSelected;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất Database
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Xuất Database</DialogTitle>
          <DialogDescription>
            Chọn các mục bạn muốn xuất ra file JSON
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 pb-3 border-b mb-3">
            <Checkbox 
              id="select-all"
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
            />
            <Label 
              htmlFor="select-all" 
              className="text-sm font-semibold cursor-pointer"
            >
              Chọn tất cả ({EXPORT_CATEGORIES.length} nhóm)
            </Label>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {EXPORT_CATEGORIES.map((category) => (
                <div 
                  key={category.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <Checkbox 
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleToggleCategory(category.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <Label 
                      htmlFor={category.id} 
                      className="text-sm font-medium cursor-pointer block"
                    >
                      {category.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {category.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {category.tables.length} bảng: {category.tables.slice(0, 3).join(', ')}
                      {category.tables.length > 3 && ` +${category.tables.length - 3}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={exporting || selectedCategories.length === 0}
            className="gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Xuất ({getSelectedTables().length} bảng)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
