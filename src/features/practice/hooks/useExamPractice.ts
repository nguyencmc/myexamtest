// Hooks for practicing with exam questions
import { useQuery } from '@tanstack/react-query';
import { fetchExamById, fetchExamQuestions, ExamInfo } from '../api/examPractice';

export function useExam(examId: string | undefined) {
  return useQuery({
    queryKey: ['exam-practice', examId],
    queryFn: () => fetchExamById(examId!),
    enabled: !!examId,
  });
}

export function useExamQuestions(
  examId: string | undefined,
  options?: {
    limit?: number;
    shuffle?: boolean;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ['exam-practice-questions', examId, options?.limit, options?.shuffle],
    queryFn: () => fetchExamQuestions(examId!, {
      limit: options?.limit,
      shuffle: options?.shuffle,
    }),
    enabled: (options?.enabled ?? true) && !!examId,
    staleTime: 0, // Always refetch to get new random order
  });
}
