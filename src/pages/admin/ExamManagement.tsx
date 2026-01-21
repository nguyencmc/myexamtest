import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Users,
  HelpCircle,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface Exam {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  question_count: number | null;
  attempt_count: number | null;
  difficulty: string | null;
  duration_minutes: number | null;
  created_at: string;
  category_id: string | null;
}

interface ExamCategory {
  id: string;
  name: string;
  slug: string;
}

interface QuestionSet {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  tags: string[] | null;
  is_published: boolean | null;
  question_count: number | null;
  created_at: string;
}

const ExamManagement = () => {
  const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeTab = searchParams.get('tab') || 'exams';

  const hasAccess = isAdmin || isTeacher;

  useEffect(() => {
    if (!roleLoading && !hasAccess) {
      navigate('/');
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn cần quyền Teacher hoặc Admin",
        variant: "destructive",
      });
    }
  }, [hasAccess, roleLoading, navigate, toast]);

  useEffect(() => {
    if (hasAccess) {
      fetchData();
    }
  }, [hasAccess]);

  const fetchData = async () => {
    setLoading(true);
    
    const [{ data: examsData }, { data: categoriesData }, { data: setsData }] = await Promise.all([
      supabase.from('exams').select('*').order('created_at', { ascending: false }),
      supabase.from('exam_categories').select('id, name, slug'),
      supabase.from('question_sets').select('*').order('created_at', { ascending: false }),
    ]);

    setExams(examsData || []);
    setCategories(categoriesData || []);
    setQuestionSets(setsData || []);
    setLoading(false);
  };

  const handleDeleteExam = async (examId: string) => {
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('exam_id', examId);

    if (questionsError) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi của đề thi",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa đề thi",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thành công",
      description: "Đã xóa đề thi",
    });
    
    fetchData();
  };

  const handleDeleteQuestionSet = async (setId: string) => {
    // Delete questions first
    const { error: questionsError } = await supabase
      .from('practice_questions')
      .delete()
      .eq('set_id', setId);

    if (questionsError) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('question_sets')
      .delete()
      .eq('id', setId);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bộ câu hỏi",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thành công",
      description: "Đã xóa bộ câu hỏi luyện tập",
    });
    
    fetchData();
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Chưa phân loại';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Không xác định';
  };

  const getLevelBadge = (level: string | null) => {
    switch (level) {
      case 'easy':
        return { label: 'Dễ', variant: 'secondary' as const };
      case 'medium':
        return { label: 'Trung bình', variant: 'default' as const };
      case 'hard':
        return { label: 'Khó', variant: 'destructive' as const };
      default:
        return { label: level || 'N/A', variant: 'outline' as const };
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuestionSets = questionSets.filter(set =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={isAdmin ? "/admin" : "/teacher"}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                Quản lý đề thi & luyện tập
              </h1>
              <p className="text-muted-foreground mt-1">
                {exams.length} đề thi • {questionSets.length} bộ luyện tập
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="exams" className="gap-2">
                <FileText className="w-4 h-4" />
                Đề thi ({exams.length})
              </TabsTrigger>
              <TabsTrigger value="practice" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Luyện tập ({questionSets.length})
              </TabsTrigger>
            </TabsList>
            
            {activeTab === 'exams' ? (
              <Link to="/admin/exams/create">
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  Tạo đề thi mới
                </Button>
              </Link>
            ) : (
              <Link to="/admin/question-sets/create">
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  Tạo bộ luyện tập
                </Button>
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'exams' ? "Tìm kiếm đề thi..." : "Tìm kiếm bộ câu hỏi..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Exams Tab */}
          <TabsContent value="exams" className="mt-0">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredExams.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">
                      {searchQuery ? 'Không tìm thấy đề thi nào' : 'Chưa có đề thi nào'}
                    </p>
                    <Link to="/admin/exams/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo đề thi đầu tiên
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên đề thi</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Độ khó</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Câu hỏi</TableHead>
                        <TableHead>Lượt làm</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{exam.title}</p>
                              {exam.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {exam.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getCategoryName(exam.category_id)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                exam.difficulty === 'easy' ? 'secondary' : 
                                exam.difficulty === 'hard' ? 'destructive' : 'default'
                              }
                            >
                              {exam.difficulty || 'medium'}
                            </Badge>
                          </TableCell>
                          <TableCell>{exam.duration_minutes || 60} phút</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <HelpCircle className="w-4 h-4 text-muted-foreground" />
                              {exam.question_count || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              {exam.attempt_count || 0}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(exam.created_at).toLocaleDateString('vi-VN')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/admin/exams/${exam.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xóa đề thi?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Hành động này không thể hoàn tác. Tất cả câu hỏi trong đề thi sẽ bị xóa.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteExam(exam.id)}>
                                      Xóa
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Practice/Question Sets Tab */}
          <TabsContent value="practice" className="mt-0">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredQuestionSets.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">
                      {searchQuery ? 'Không tìm thấy bộ câu hỏi nào' : 'Chưa có bộ câu hỏi nào'}
                    </p>
                    <Link to="/admin/question-sets/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo bộ câu hỏi đầu tiên
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên bộ câu hỏi</TableHead>
                        <TableHead>Độ khó</TableHead>
                        <TableHead>Câu hỏi</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestionSets.map((set) => {
                        const levelInfo = getLevelBadge(set.level);
                        return (
                          <TableRow key={set.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{set.title}</p>
                                {set.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {set.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={levelInfo.variant}>{levelInfo.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                {set.question_count || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap max-w-[200px]">
                                {(set.tags || []).slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {(set.tags?.length || 0) > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(set.tags?.length || 0) - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {set.is_published ? (
                                <Badge variant="default" className="gap-1">
                                  <Eye className="w-3 h-3" />
                                  Công khai
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <EyeOff className="w-3 h-3" />
                                  Nháp
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(set.created_at).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link to={`/admin/question-sets/${set.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xóa bộ câu hỏi?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Hành động này không thể hoàn tác. Tất cả câu hỏi trong bộ sẽ bị xóa.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteQuestionSet(set.id)}>
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ExamManagement;
