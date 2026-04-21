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
      clients: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone_e164: string
          professional_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone_e164: string
          professional_id?: string | null
        }
        Update: {
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
          carbs_consumed: number | null
          client_id: string | null
          id: string
          kcal_consumed: number | null
          protein_consumed: number | null
          summary_date: string
          updated_at: string | null
        }
        Insert: {
          carbs_consumed?: number | null
          client_id?: string | null
          id?: string
          kcal_consumed?: number | null
          protein_consumed?: number | null
          summary_date: string
          updated_at?: string | null
        }
        Update: {
          carbs_consumed?: number | null
          client_id?: string | null
          id?: string
          kcal_consumed?: number | null
          protein_consumed?: number | null
          summary_date?: string
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
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
