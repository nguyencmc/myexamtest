import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  Plus,
  X,
  Type
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Question {
  id?: string;
  question_text: string;
  question_image?: string;
  option_a: string;
  option_a_image?: string;
  option_b: string;
  option_b_image?: string;
  option_c: string;
  option_c_image?: string;
  option_d: string;
  option_d_image?: string;
  option_e: string;
  option_e_image?: string;
  option_f: string;
  option_f_image?: string;
  option_g: string;
  option_g_image?: string;
  option_h: string;
  option_h_image?: string;
  correct_answer: string;
  explanation: string;
  question_order: number;
}

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (index: number, field: keyof Question, value: string | number) => void;
  onRemove: (index: number) => void;
  onImageUpload?: (file: File, questionIndex: number, field: string) => Promise<string>;
}

export const QuestionEditor = ({ 
  question, 
  index, 
  onUpdate, 
  onRemove,
  onImageUpload 
}: QuestionEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadField, setCurrentUploadField] = useState<string>('');
  const { toast } = useToast();

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  const getOptionField = (letter: string) => `option_${letter.toLowerCase()}` as keyof Question;
  const getOptionImageField = (letter: string) => `option_${letter.toLowerCase()}_image` as keyof Question;

  const filledOptions = optionLabels.filter(
    letter => question[getOptionField(letter)]
  );

  const availableAnswers = optionLabels.slice(0, Math.max(2, filledOptions.length));

  const handleImageSelect = (field: string) => {
    setCurrentUploadField(field);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file ảnh',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'File ảnh không được vượt quá 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingField(currentUploadField);
    
    try {
      const url = await onImageUpload(file, index, currentUploadField);
      onUpdate(index, currentUploadField as keyof Question, url);
      toast({
        title: 'Thành công',
        description: 'Đã tải ảnh lên',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải ảnh lên',
        variant: 'destructive',
      });
    } finally {
      setUploadingField(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (field: string) => {
    onUpdate(index, field as keyof Question, '');
  };

  const insertFormula = (field: keyof Question) => {
    const currentValue = question[field] as string || '';
    const formulaTemplate = ' $\\frac{a}{b}$ ';
    onUpdate(index, field, currentValue + formulaTemplate);
  };

  return (
    <Card className="border-border/50 overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="py-3 px-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Badge variant="secondary" className="font-mono">
                  Câu {index + 1}
                </Badge>
                <span className="text-sm text-muted-foreground truncate max-w-md">
                  {question.question_text || 'Chưa nhập câu hỏi...'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            
            <div className="flex items-center gap-2">
              <Select
                value={question.correct_answer}
                onValueChange={(value) => onUpdate(index, 'correct_answer', value)}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableAnswers.map((letter) => (
                    <SelectItem key={letter} value={letter}>
                      {letter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">
            {/* Question Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Nội dung câu hỏi *</Label>
                <div className="flex gap-1">
                  {onImageUpload && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleImageSelect('question_image')}
                      disabled={uploadingField === 'question_image'}
                    >
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Ảnh
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => insertFormula('question_text')}
                  >
                    <Type className="w-3 h-3 mr-1" />
                    Công thức
                  </Button>
                </div>
              </div>
              <Textarea
                value={question.question_text}
                onChange={(e) => onUpdate(index, 'question_text', e.target.value)}
                placeholder="Nhập câu hỏi... (Hỗ trợ LaTeX: $công thức$)"
                rows={3}
              />
              {question.question_image && (
                <div className="relative inline-block">
                  <img 
                    src={question.question_image} 
                    alt="Question" 
                    className="max-h-32 rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => removeImage('question_image')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid gap-3">
              <Label>Đáp án</Label>
              {optionLabels.slice(0, 4).map((letter) => (
                <OptionInput
                  key={letter}
                  letter={letter}
                  value={question[getOptionField(letter)] as string}
                  imageUrl={question[getOptionImageField(letter)] as string}
                  isCorrect={question.correct_answer === letter}
                  required={letter === 'A' || letter === 'B'}
                  onChange={(value) => onUpdate(index, getOptionField(letter), value)}
                  onImageSelect={onImageUpload ? () => handleImageSelect(getOptionImageField(letter)) : undefined}
                  onImageRemove={() => removeImage(getOptionImageField(letter))}
                  onInsertFormula={() => insertFormula(getOptionField(letter))}
                  isUploading={uploadingField === getOptionImageField(letter)}
                />
              ))}
              
              {/* More Options (E-H) */}
              {optionLabels.slice(4).some(letter => question[getOptionField(letter)]) && (
                optionLabels.slice(4).map((letter) => {
                  if (!question[getOptionField(letter)] && 
                      optionLabels.slice(4).indexOf(letter) > 0 && 
                      !question[getOptionField(optionLabels[optionLabels.indexOf(letter) - 1])]) {
                    return null;
                  }
                  return (
                    <OptionInput
                      key={letter}
                      letter={letter}
                      value={question[getOptionField(letter)] as string}
                      imageUrl={question[getOptionImageField(letter)] as string}
                      isCorrect={question.correct_answer === letter}
                      required={false}
                      onChange={(value) => onUpdate(index, getOptionField(letter), value)}
                      onImageSelect={onImageUpload ? () => handleImageSelect(getOptionImageField(letter)) : undefined}
                      onImageRemove={() => removeImage(getOptionImageField(letter))}
                      onInsertFormula={() => insertFormula(getOptionField(letter))}
                      isUploading={uploadingField === getOptionImageField(letter)}
                    />
                  );
                })
              )}
              
              {/* Add More Options Button */}
              {!question.option_e && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => onUpdate(index, 'option_e', ' ')}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Thêm đáp án E-H
                </Button>
              )}
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label>Giải thích (tùy chọn)</Label>
              <Textarea
                value={question.explanation}
                onChange={(e) => onUpdate(index, 'explanation', e.target.value)}
                placeholder="Giải thích đáp án đúng..."
                rows={2}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Option Input Component
interface OptionInputProps {
  letter: string;
  value: string;
  imageUrl?: string;
  isCorrect: boolean;
  required: boolean;
  onChange: (value: string) => void;
  onImageSelect?: () => void;
  onImageRemove: () => void;
  onInsertFormula: () => void;
  isUploading: boolean;
}

const OptionInput = ({
  letter,
  value,
  imageUrl,
  isCorrect,
  required,
  onChange,
  onImageSelect,
  onImageRemove,
  onInsertFormula,
  isUploading,
}: OptionInputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge 
          variant={isCorrect ? "default" : "outline"}
          className={isCorrect ? "bg-green-600" : ""}
        >
          {letter}
        </Badge>
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Đáp án ${letter}${required ? ' *' : ''}`}
            className={isCorrect ? "border-green-500 focus-visible:ring-green-500" : ""}
          />
        </div>
        <div className="flex gap-1">
          {onImageSelect && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onImageSelect}
              disabled={isUploading}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onInsertFormula}
          >
            <Type className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {imageUrl && (
        <div className="relative inline-block ml-8">
          <img 
            src={imageUrl} 
            alt={`Option ${letter}`} 
            className="max-h-20 rounded border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-5 w-5"
            onClick={onImageRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
