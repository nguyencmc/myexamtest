import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChoiceItem } from './ChoiceItem';
import type { PracticeQuestion } from '../types';

interface QuestionCardProps {
  question: PracticeQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean | null;
  onSelectAnswer: (choiceId: string) => void;
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showResult,
  isCorrect,
  onSelectAnswer,
}: QuestionCardProps) {
  const getDifficultyBadge = (difficulty: number) => {
    if (difficulty <= 2) return { label: 'Dễ', variant: 'secondary' as const };
    if (difficulty === 3) return { label: 'Trung bình', variant: 'default' as const };
    return { label: 'Khó', variant: 'destructive' as const };
  };

  const difficultyInfo = getDifficultyBadge(question.difficulty);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Câu {questionNumber}/{totalQuestions}
            </span>
            <Badge variant={difficultyInfo.variant}>{difficultyInfo.label}</Badge>
          </div>
          {question.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {question.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question prompt */}
        <div className="text-lg font-medium leading-relaxed">{question.prompt}</div>

        {/* Choices */}
        <div className="space-y-3">
          {question.choices.map((choice, index) => (
            <ChoiceItem
              key={choice.id}
              id={choice.id}
              text={choice.text}
              label={CHOICE_LABELS[index]}
              isSelected={selectedAnswer === choice.id}
              isCorrect={isCorrect}
              showResult={showResult}
              correctAnswer={question.answer as string}
              disabled={showResult}
              onSelect={onSelectAnswer}
            />
          ))}
        </div>

        {/* Explanation */}
        {showResult && question.explanation && (
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              💡 Giải thích
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
