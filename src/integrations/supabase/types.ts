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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      code_drafts: {
        Row: {
          code: string
          explanation: string
          id: string
          lab: string
          scout_id: string
          updated_at: string
        }
        Insert: {
          code?: string
          explanation?: string
          id?: string
          lab: string
          scout_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          explanation?: string
          id?: string
          lab?: string
          scout_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_drafts_scout_id_fkey"
            columns: ["scout_id"]
            isOneToOne: false
            referencedRelation: "scouts"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          module_id: string
          scout_id: string
          step: number
          updated_at: string
        }
        Insert: {
          module_id: string
          scout_id: string
          step?: number
          updated_at?: string
        }
        Update: {
          module_id?: string
          scout_id?: string
          step?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_scout_id_fkey"
            columns: ["scout_id"]
            isOneToOne: false
            referencedRelation: "scouts"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          account_key: string
          created_at: string
          id: number
          success: boolean
        }
        Insert: {
          account_key: string
          created_at?: string
          id?: number
          success: boolean
        }
        Update: {
          account_key?: string
          created_at?: string
          id?: number
          success?: boolean
        }
        Relationships: []
      }
      responses: {
        Row: {
          answer: string
          counselor_note: string | null
          id: string
          question_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          scout_id: string
          status: Database["public"]["Enums"]["response_status"]
          updated_at: string
        }
        Insert: {
          answer?: string
          counselor_note?: string | null
          id?: string
          question_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          scout_id: string
          status?: Database["public"]["Enums"]["response_status"]
          updated_at?: string
        }
        Update: {
          answer?: string
          counselor_note?: string | null
          id?: string
          question_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          scout_id?: string
          status?: Database["public"]["Enums"]["response_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_scout_id_fkey"
            columns: ["scout_id"]
            isOneToOne: false
            referencedRelation: "scouts"
            referencedColumns: ["id"]
          },
        ]
      }
      scouts: {
        Row: {
          account_id: string
          active: boolean
          code_reset_at: string | null
          created_at: string
          first_name: string
          id: string
          is_demo: boolean
          last_initial: string
        }
        Insert: {
          account_id: string
          active?: boolean
          code_reset_at?: string | null
          created_at?: string
          first_name: string
          id: string
          is_demo?: boolean
          last_initial: string
        }
        Update: {
          account_id?: string
          active?: boolean
          code_reset_at?: string | null
          created_at?: string
          first_name?: string
          id?: string
          is_demo?: boolean
          last_initial?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          attendees: string[]
          created_at: string
          created_by: string
          focus: string
          id: string
          notes: string
          session_date: string
        }
        Insert: {
          attendees?: string[]
          created_at?: string
          created_by?: string
          focus?: string
          id?: string
          notes?: string
          session_date?: string
        }
        Update: {
          attendees?: string[]
          created_at?: string
          created_by?: string
          focus?: string
          id?: string
          notes?: string
          session_date?: string
        }
        Relationships: []
      }
      signoffs: {
        Row: {
          id: string
          note: string | null
          requirement: string
          scout_id: string
          signed_at: string
          signed_by: string
        }
        Insert: {
          id?: string
          note?: string | null
          requirement: string
          scout_id: string
          signed_at?: string
          signed_by?: string
        }
        Update: {
          id?: string
          note?: string | null
          requirement?: string
          scout_id?: string
          signed_at?: string
          signed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "signoffs_scout_id_fkey"
            columns: ["scout_id"]
            isOneToOne: false
            referencedRelation: "scouts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "counselor" | "scout"
      response_status: "draft" | "submitted" | "returned" | "approved"
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
    Enums: {
      app_role: ["counselor", "scout"],
      response_status: ["draft", "submitted", "returned", "approved"],
    },
  },
} as const