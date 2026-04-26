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
      activity_logs: {
        Row: {
          activity_distance: string | null
          activity_duration: string | null
          activity_steps: number | null
          activity_type: string | null
          client_id: string | null
          created_at: string | null
          estimated_burn_kcal: number | null
          id: string
          image_path: string | null
          media_content_type: string | null
          media_url: string | null
          original_text: string | null
          raw_payload: Json | null
          source: string | null
          status: string | null
          twilio_message_sid: string | null
        }
        Insert: {
          activity_distance?: string | null
          activity_duration?: string | null
          activity_steps?: number | null
          activity_type?: string | null
          client_id?: string | null
          created_at?: string | null
          estimated_burn_kcal?: number | null
          id?: string
          image_path?: string | null
          media_content_type?: string | null
          media_url?: string | null
          original_text?: string | null
          raw_payload?: Json | null
          source?: string | null
          status?: string | null
          twilio_message_sid?: string | null
        }
        Update: {
          activity_distance?: string | null
          activity_duration?: string | null
          activity_steps?: number | null
          activity_type?: string | null
          client_id?: string | null
          created_at?: string | null
          estimated_burn_kcal?: number | null
          id?: string
          image_path?: string | null
          media_content_type?: string | null
          media_url?: string | null
          original_text?: string | null
          raw_payload?: Json | null
          source?: string | null
          status?: string | null
          twilio_message_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      bioimpedance: {
        Row: {
          basal_rate: number | null
          body_fat: number | null
          body_water: number | null
          bone_mass: number | null
          created_at: string
          height: number | null
          id: string
          metabolic_age: number | null
          muscle_mass: number | null
          pdf_path: string | null
          source: string | null
          updated_at: string
          user_id: string
          visceral_fat: number | null
          weight: number | null
        }
        Insert: {
          basal_rate?: number | null
          body_fat?: number | null
          body_water?: number | null
          bone_mass?: number | null
          created_at?: string
          height?: number | null
          id?: string
          metabolic_age?: number | null
          muscle_mass?: number | null
          pdf_path?: string | null
          source?: string | null
          updated_at?: string
          user_id: string
          visceral_fat?: number | null
          weight?: number | null
        }
        Update: {
          basal_rate?: number | null
          body_fat?: number | null
          body_water?: number | null
          bone_mass?: number | null
          created_at?: string
          height?: number | null
          id?: string
          metabolic_age?: number | null
          muscle_mass?: number | null
          pdf_path?: string | null
          source?: string | null
          updated_at?: string
          user_id?: string
          visceral_fat?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      client_goals: {
        Row: {
          calories_target: number | null
          carbs_target: number | null
          client_id: string
          id: string
          notes: string | null
          objective: string | null
          professional_id: string
          protein_target: number | null
          updated_at: string
        }
        Insert: {
          calories_target?: number | null
          carbs_target?: number | null
          client_id: string
          id?: string
          notes?: string | null
          objective?: string | null
          professional_id: string
          protein_target?: number | null
          updated_at?: string
        }
        Update: {
          calories_target?: number | null
          carbs_target?: number | null
          client_id?: string
          id?: string
          notes?: string | null
          objective?: string | null
          professional_id?: string
          protein_target?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          basal_rate_kcal: number
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone_e164: string
          professional_id: string | null
        }
        Insert: {
          basal_rate_kcal?: number
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone_e164: string
          professional_id?: string | null
        }
        Update: {
          basal_rate_kcal?: number
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone_e164?: string
          professional_id?: string | null
        }
        Relationships: []
      }
      daily_summary: {
        Row: {
          activity_count: number | null
          basal_kcal: number
          calorie_balance: number | null
          carbs_consumed: number | null
          client_id: string | null
          fat_consumed: number | null
          id: string
          kcal_burned: number | null
          kcal_consumed: number | null
          meal_count: number | null
          protein_consumed: number | null
          summary_date: string
          total_expenditure_kcal: number
          updated_at: string | null
        }
        Insert: {
          activity_count?: number | null
          basal_kcal?: number
          calorie_balance?: number | null
          carbs_consumed?: number | null
          client_id?: string | null
          fat_consumed?: number | null
          id?: string
          kcal_burned?: number | null
          kcal_consumed?: number | null
          meal_count?: number | null
          protein_consumed?: number | null
          summary_date: string
          total_expenditure_kcal?: number
          updated_at?: string | null
        }
        Update: {
          activity_count?: number | null
          basal_kcal?: number
          calorie_balance?: number | null
          carbs_consumed?: number | null
          client_id?: string | null
          fat_consumed?: number | null
          id?: string
          kcal_burned?: number | null
          kcal_consumed?: number | null
          meal_count?: number | null
          protein_consumed?: number | null
          summary_date?: string
          total_expenditure_kcal?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_summary_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_goals: {
        Row: {
          calories_target: number
          carbs_target: number
          created_at: string
          id: string
          name: string
          notes: string | null
          objective: string
          protein_target: number
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_target?: number
          carbs_target?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          objective?: string
          protein_target?: number
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_target?: number
          carbs_target?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          objective?: string
          protein_target?: number
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diet_plan_foods: {
        Row: {
          carbs: number | null
          fat: number | null
          food_name: string
          id: string
          kcal: number | null
          meal_id: string
          protein: number | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          carbs?: number | null
          fat?: number | null
          food_name: string
          id?: string
          kcal?: number | null
          meal_id: string
          protein?: number | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          carbs?: number | null
          fat?: number | null
          food_name?: string
          id?: string
          kcal?: number | null
          meal_id?: string
          protein?: number | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_plan_foods_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "diet_plan_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_plan_meals: {
        Row: {
          id: string
          meal_order: number | null
          name: string
          plan_id: string
          target_carbs: number | null
          target_fat: number | null
          target_kcal: number | null
          target_protein: number | null
          time_suggestion: string | null
        }
        Insert: {
          id?: string
          meal_order?: number | null
          name: string
          plan_id: string
          target_carbs?: number | null
          target_fat?: number | null
          target_kcal?: number | null
          target_protein?: number | null
          time_suggestion?: string | null
        }
        Update: {
          id?: string
          meal_order?: number | null
          name?: string
          plan_id?: string
          target_carbs?: number | null
          target_fat?: number | null
          target_kcal?: number | null
          target_protein?: number | null
          time_suggestion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_plan_meals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_plans: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          objective: string | null
          professional_id: string | null
          total_carbs: number | null
          total_fat: number | null
          total_kcal: number | null
          total_protein: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          objective?: string | null
          professional_id?: string | null
          total_carbs?: number | null
          total_fat?: number | null
          total_kcal?: number | null
          total_protein?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          objective?: string | null
          professional_id?: string | null
          total_carbs?: number | null
          total_fat?: number | null
          total_kcal?: number | null
          total_protein?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          client_id: string | null
          created_at: string | null
          estimated_carbs: number | null
          estimated_fat: number | null
          estimated_kcal: number | null
          estimated_protein: number | null
          id: string
          image_path: string | null
          media_content_type: string | null
          media_url: string | null
          original_text: string | null
          source: string | null
          status: string | null
          twilio_message_sid: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          estimated_carbs?: number | null
          estimated_fat?: number | null
          estimated_kcal?: number | null
          estimated_protein?: number | null
          id?: string
          image_path?: string | null
          media_content_type?: string | null
          media_url?: string | null
          original_text?: string | null
          source?: string | null
          status?: string | null
          twilio_message_sid?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          estimated_carbs?: number | null
          estimated_fat?: number | null
          estimated_kcal?: number | null
          estimated_protein?: number | null
          id?: string
          image_path?: string | null
          media_content_type?: string | null
          media_url?: string | null
          original_text?: string | null
          source?: string | null
          status?: string | null
          twilio_message_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_signups: {
        Row: {
          created_at: string
          crn: string
          document_path: string
          email: string
          full_name: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selected_plan: string
          status: Database["public"]["Enums"]["pro_signup_status"]
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          crn: string
          document_path: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selected_plan?: string
          status?: Database["public"]["Enums"]["pro_signup_status"]
          updated_at?: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          crn?: string
          document_path?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selected_plan?: string
          status?: Database["public"]["Enums"]["pro_signup_status"]
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      professional_notes: {
        Row: {
          client_id: string
          content: string
          created_at: string
          id: string
          professional_id: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          id?: string
          professional_id: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          created_by: string | null
          customer_name: string | null
          email: string
          expires_at: string | null
          external_id: string | null
          id: string
          plan: string | null
          provider: string
          raw_payload: Json | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          email: string
          expires_at?: string | null
          external_id?: string | null
          id?: string
          plan?: string | null
          provider?: string
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          email?: string
          expires_at?: string | null
          external_id?: string | null
          id?: string
          plan?: string | null
          provider?: string
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          client_id: string | null
          created_at: string | null
          direction: string
          id: string
          media_count: number | null
          message_type: string
          raw_payload: Json | null
          text_body: string | null
          twilio_message_sid: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          direction: string
          id?: string
          media_count?: number | null
          message_type: string
          raw_payload?: Json | null
          text_body?: string | null
          twilio_message_sid?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          media_count?: number | null
          message_type?: string
          raw_payload?: Json | null
          text_body?: string | null
          twilio_message_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_client_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_subscription_active: { Args: { _email: string }; Returns: boolean }
      recompute_daily_summary: {
        Args: { _client_id: string; _date: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "profissional"
      pro_signup_status: "pending" | "approved" | "rejected"
      subscription_status:
        | "active"
        | "cancelled"
        | "expired"
        | "past_due"
        | "refunded"
        | "pending"
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
    Enums: {
      app_role: ["admin", "user", "profissional"],
      pro_signup_status: ["pending", "approved", "rejected"],
      subscription_status: [
        "active",
        "cancelled",
        "expired",
        "past_due",
        "refunded",
        "pending",
      ],
    },
  },
} as const
