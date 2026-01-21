// API for practicing with exam questions (from exams/questions tables)
import { supabase } from '@/integrations/supabase/client';
import type { PracticeQuestion, Choice } from '../types';

export interface ExamInfo {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  question_count: number;
  duration_minutes: number | null;
  difficulty: string | null;
}

// Fetch exam info by ID
export async function fetchExamById(examId: string): Promise<ExamInfo | null> {
  const { data, error } = await supabase
    .from('exams')
    .select('id, title, description, slug, question_count, duration_minutes, difficulty')
    .eq('id', examId)
    .single();

  if (error) {
    // Try to find by slug
    const { data: dataBySlug, error: slugError } = await supabase
      .from('exams')
      .select('id, title, description, slug, question_count, duration_minutes, difficulty')
      .eq('slug', examId)
      .single();
    
    if (slugError) return null;
    return dataBySlug as ExamInfo;
  }
  return data as ExamInfo;
}

// Fetch questions from exams/questions table and convert to PracticeQuestion format
export async function fetchExamQuestions(
  examId: string,
  options?: {
    limit?: number;
    shuffle?: boolean;
  }
): Promise<PracticeQuestion[]> {
  // First get the exam to confirm it exists
  const exam = await fetchExamById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', exam.id)
    .order('question_order', { ascending: true });

  if (error) throw error;

  // Convert exam questions to PracticeQuestion format
  let questions: PracticeQuestion[] = (data || []).map((q: any) => {
    // Build choices array from option_a, option_b, etc.
    const choices: Choice[] = [];
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const optionFields = ['option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'option_f', 'option_g', 'option_h'];
    
    optionFields.forEach((field, index) => {
      if (q[field]) {
        choices.push({
          id: optionLabels[index],
          text: q[field],
        });
      }
    });

    return {
      id: q.id,
      set_id: exam.id, // Use exam_id as set_id for compatibility
      type: 'mcq_single' as const,
      prompt: q.question_text,
      choices,
      answer: q.correct_answer, // e.g., "A", "B", etc.
      explanation: q.explanation,
      difficulty: 3, // Default medium difficulty
      tags: [],
      question_order: q.question_order || 0,
      created_at: q.created_at,
    };
  });

  // Shuffle if requested
  if (options?.shuffle) {
    questions = questions.sort(() => Math.random() - 0.5);
  }

  // Limit
  if (options?.limit && options.limit > 0) {
    questions = questions.slice(0, options.limit);
  }

  return questions;
}
