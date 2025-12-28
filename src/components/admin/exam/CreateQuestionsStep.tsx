import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Upload, 
  Plus,
  FileText,
  Wand2,
  FileSpreadsheet
} from 'lucide-react';
import { AIQuestionGenerator } from '@/components/ai/AIQuestionGenerator';
import { ImportExportQuestions } from '@/components/admin/ImportExportQuestions';
import { QuestionEditor, type Question } from './QuestionEditor';

interface CreateQuestionsStepProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onImageUpload?: (file: File, questionIndex: number, field: string) => Promise<string>;
}

export const CreateQuestionsStep = ({
  questions,
  onQuestionsChange,
  onImageUpload,
}: CreateQuestionsStepProps) => {
  const [activeTab, setActiveTab] = useState('manual');

  const addQuestion = () => {
    const newQuestion: Question = {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      option_e: '',
      option_f: '',
      option_g: '',
      option_h: '',
      correct_answer: 'A',
      explanation: '',
      question_order: questions.length + 1,
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    onQuestionsChange(updated);
  };

  const removeQuestion = (index: number) => {
    onQuestionsChange(questions.filter((_, i) => i !== index));
  };

  const handleAIQuestionsGenerated = (newQuestions: any[]) => {
    const mapped = newQuestions.map((q, i) => ({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      option_e: '',
      option_f: '',
      option_g: '',
      option_h: '',
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      question_order: questions.length + i + 1,
    }));
    onQuestionsChange([...questions, ...mapped]);
    setActiveTab('manual');
  };

  const handleImport = (importedQuestions: Question[]) => {
    onQuestionsChange(importedQuestions);
    setActiveTab('manual');
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-medium">{questions.length}</span>
            <span className="text-muted-foreground">câu hỏi</span>
          </div>
        </div>
        <ImportExportQuestions 
          questions={questions} 
          onImport={handleImport}
        />
      </div>

      {/* Creation Methods */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="manual" className="flex items-center gap-2 py-3">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thủ công</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2 py-3">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2 py-3">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6 space-y-4">
          {/* Question List */}
          {questions.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">Chưa có câu hỏi nào</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Bắt đầu bằng cách thêm câu hỏi thủ công hoặc sử dụng AI
                </p>
                <Button onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm câu hỏi đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {questions.map((question, index) => (
                <QuestionEditor
                  key={index}
                  question={question}
                  index={index}
                  onUpdate={updateQuestion}
                  onRemove={removeQuestion}
                  onImageUpload={onImageUpload}
                />
              ))}
              
              <Button 
                onClick={addQuestion} 
                variant="outline" 
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm câu hỏi mới
              </Button>
            </>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AIQuestionGenerator 
            onQuestionsGenerated={handleAIQuestionsGenerated}
          />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                Import câu hỏi từ file
              </CardTitle>
              <CardDescription>
                Hỗ trợ định dạng CSV, TXT, JSON với tối đa 8 đáp án (A-H)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Badge variant="outline">TXT</Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Câu hỏi bắt đầu bằng "Question" hoặc "Câu", đáp án A-H trên từng dòng, dùng * đánh dấu đáp án đúng
                  </p>
                </Card>
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Badge variant="outline">CSV</Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Cột: Câu hỏi, A, B, C, D, E, F, G, H, Đáp án đúng, Giải thích
                  </p>
                </Card>
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Badge variant="outline">JSON</Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Mảng object với các field: question_text, option_a-h, correct_answer
                  </p>
                </Card>
              </div>
              
              <div className="pt-4 border-t">
                <ImportExportQuestions 
                  questions={questions} 
                  onImport={handleImport}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
