export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          category: string
          created_at: string
          creator_id: string | null
          creator_name: string | null
          description: string | null
          id: string
          image_url: string | null
          is_official: boolean | null
          subcategory: string | null
          term_count: number | null
          title: string
          topic: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_official?: boolean | null
          subcategory?: string | null
          term_count?: number | null
          title: string
          topic?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_official?: boolean | null
          subcategory?: string | null
          term_count?: number | null
          title?: string
          topic?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json | null
          completed_at: string
          correct_answers: number | null
          created_at: string
          exam_id: string | null
          id: string
          score: number | null
          time_spent_seconds: number | null
          total_questions: number | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          correct_answers?: number | null
          created_at?: string
          exam_id?: string | null
          id?: string
          score?: number | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          correct_answers?: number | null
          created_at?: string
          exam_id?: string | null
          id?: string
          score?: number | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_categories: {
        Row: {
          attempt_count: number | null
          created_at: string
          display_order: number | null
          exam_count: number | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          name: string
          question_count: number | null
          rating: number | null
          slug: string
          subcategory_count: number | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string
          display_order?: number | null
          exam_count?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          question_count?: number | null
          rating?: number | null
          slug: string
          subcategory_count?: number | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string
          display_order?: number | null
          exam_count?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          question_count?: number | null
          rating?: number | null
          slug?: string
          subcategory_count?: number | null
        }
        Relationships: []
      }
      exams: {
        Row: {
          attempt_count: number | null
          category_id: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_featured: boolean | null
          pass_rate: number | null
          question_count: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          pass_rate?: number | null
          question_count?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          pass_rate?: number | null
          question_count?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_sets: {
        Row: {
          card_count: number | null
          category: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          card_count?: number | null
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          card_count?: number | null
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back_text: string
          card_order: number | null
          created_at: string
          front_text: string
          id: string
          set_id: string | null
        }
        Insert: {
          back_text: string
          card_order?: number | null
          created_at?: string
          front_text: string
          id?: string
          set_id?: string | null
        }
        Update: {
          back_text?: string
          card_order?: number | null
          created_at?: string
          front_text?: string
          id?: string
          set_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          exam_id: string | null
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string | null
          option_d: string | null
          question_order: number | null
          question_text: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          exam_id?: string | null
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c?: string | null
          option_d?: string | null
          question_order?: number | null
          question_text: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          exam_id?: string | null
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string | null
          option_d?: string | null
          question_order?: number | null
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flashcard_progress: {
        Row: {
          created_at: string
          flashcard_id: string | null
          id: string
          is_remembered: boolean | null
          last_reviewed_at: string | null
          review_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          flashcard_id?: string | null
          id?: string
          is_remembered?: boolean | null
          last_reviewed_at?: string | null
          review_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          flashcard_id?: string | null
          id?: string
          is_remembered?: boolean | null
          last_reviewed_at?: string | null
          review_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcard_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
