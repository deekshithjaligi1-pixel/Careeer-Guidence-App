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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dsa_level_progress: {
        Row: {
          coding_completed: boolean
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          last_code: string | null
          level_id: string
          quiz_completed: boolean
          quiz_passed: boolean
          quiz_score: number
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coding_completed?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_code?: string | null
          level_id: string
          quiz_completed?: boolean
          quiz_passed?: boolean
          quiz_score?: number
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coding_completed?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_code?: string | null
          level_id?: string
          quiz_completed?: boolean
          quiz_passed?: boolean
          quiz_score?: number
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dsa_quiz_attempts: {
        Row: {
          created_at: string
          id: string
          level_id: string
          passed: boolean
          score: number
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_id: string
          passed: boolean
          score: number
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level_id?: string
          passed?: boolean
          score?: number
          topic_id?: string
          user_id?: string
        }
        Relationships: []
      }
      dsa_solved_problems: {
        Row: {
          problem_id: string
          solved_at: string
          user_id: string
        }
        Insert: {
          problem_id: string
          solved_at?: string
          user_id: string
        }
        Update: {
          problem_id?: string
          solved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_reviews: {
        Row: {
          created_at: string
          file_name: string | null
          id: string
          overall_score: number | null
          review: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          id?: string
          overall_score?: number | null
          review: Json
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          id?: string
          overall_score?: number | null
          review?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      assessment_results: {
        Row: {
          assessment_id: string | null
          created_at: string
          detailed_report: Json | null
          id: string
          recommendations: Json
          strengths: Json
          user_id: string
          weak_topics: Json
          weaknesses: Json
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          detailed_report?: Json | null
          id?: string
          recommendations?: Json
          strengths?: Json
          user_id: string
          weak_topics?: Json
          weaknesses?: Json
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          detailed_report?: Json | null
          id?: string
          recommendations?: Json
          strengths?: Json
          user_id?: string
          weak_topics?: Json
          weaknesses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "skill_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_reports: {
        Row: {
          created_at: string
          detailed_report: Json | null
          feedback: string | null
          id: string
          interview_id: string | null
          recommendations: Json
          strengths: Json
          user_id: string
          weaknesses: Json
        }
        Insert: {
          created_at?: string
          detailed_report?: Json | null
          feedback?: string | null
          id?: string
          interview_id?: string | null
          recommendations?: Json
          strengths?: Json
          user_id: string
          weaknesses?: Json
        }
        Update: {
          created_at?: string
          detailed_report?: Json | null
          feedback?: string | null
          id?: string
          interview_id?: string | null
          recommendations?: Json
          strengths?: Json
          user_id?: string
          weaknesses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "interview_reports_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "mock_interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_interviews: {
        Row: {
          completed_at: string
          difficulty: string
          id: string
          interview_type: string
          score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          difficulty: string
          id?: string
          interview_type: string
          score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          difficulty?: string
          id?: string
          interview_type?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          education: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          education?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          education?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          id: string
          resume_data: Json
          review_result: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resume_data?: Json
          review_result?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resume_data?: Json
          review_result?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_assessments: {
        Row: {
          completed_at: string
          difficulty: string
          id: string
          percentage: number | null
          score: number | null
          technology: string
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          difficulty: string
          id?: string
          percentage?: number | null
          score?: number | null
          technology: string
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          difficulty?: string
          id?: string
          percentage?: number | null
          score?: number | null
          technology?: string
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: never
        Returns: {
          assessments: number
          avg_assessment_score: number | null
          avg_interview_score: number | null
          best_ats_score: number | null
          dsa_levels_completed: number
          education: string | null
          email: string | null
          email_verified: boolean
          full_name: string | null
          has_resume: boolean
          interviews: number
          is_admin: boolean
          joined_at: string
          last_active_at: string | null
          last_sign_in_at: string | null
          problems_solved: number
          resume_reviews: number
          user_id: string
        }[]
      }
      admin_overview: { Args: never; Returns: Json }
      admin_user_detail: { Args: { target: string }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
