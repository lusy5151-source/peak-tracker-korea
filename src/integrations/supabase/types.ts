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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      hiking_journals: {
        Row: {
          course_name: string | null
          course_notes: string | null
          course_starting_point: string | null
          created_at: string
          difficulty: string | null
          duration: string | null
          hiked_at: string
          id: string
          mountain_id: number
          notes: string | null
          photos: string[] | null
          tagged_friends: string[] | null
          updated_at: string
          user_id: string
          visibility: string
          weather: string | null
        }
        Insert: {
          course_name?: string | null
          course_notes?: string | null
          course_starting_point?: string | null
          created_at?: string
          difficulty?: string | null
          duration?: string | null
          hiked_at?: string
          id?: string
          mountain_id: number
          notes?: string | null
          photos?: string[] | null
          tagged_friends?: string[] | null
          updated_at?: string
          user_id: string
          visibility?: string
          weather?: string | null
        }
        Update: {
          course_name?: string | null
          course_notes?: string | null
          course_starting_point?: string | null
          created_at?: string
          difficulty?: string | null
          duration?: string | null
          hiked_at?: string
          id?: string
          mountain_id?: number
          notes?: string | null
          photos?: string[] | null
          tagged_friends?: string[] | null
          updated_at?: string
          user_id?: string
          visibility?: string
          weather?: string | null
        }
        Relationships: []
      }
      hiking_plans: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          invite_code: string
          mountain_id: number
          notes: string | null
          planned_date: string
          start_time: string | null
          status: string
          trail_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          invite_code?: string
          mountain_id: number
          notes?: string | null
          planned_date: string
          start_time?: string | null
          status?: string
          trail_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          invite_code?: string
          mountain_id?: number
          notes?: string | null
          planned_date?: string
          start_time?: string | null
          status?: string
          trail_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      journal_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          journal_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          journal_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          journal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_comments_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "hiking_journals"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_likes: {
        Row: {
          created_at: string
          id: string
          journal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          journal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          journal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_likes_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "hiking_journals"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_edit_history: {
        Row: {
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          plan_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          plan_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          plan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_edit_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "hiking_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          plan_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          plan_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          plan_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_notifications_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "hiking_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_participants: {
        Row: {
          id: string
          invited_at: string
          plan_id: string
          responded_at: string | null
          rsvp_status: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string
          plan_id: string
          responded_at?: string | null
          rsvp_status?: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string
          plan_id?: string
          responded_at?: string | null
          rsvp_status?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_participants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "hiking_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_settings: {
        Row: {
          allow_friend_requests: boolean
          created_at: string
          id: string
          journal_visibility: string
          profile_visibility: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_friend_requests?: boolean
          created_at?: string
          id?: string
          journal_visibility?: string
          profile_visibility?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_friend_requests?: boolean
          created_at?: string
          id?: string
          journal_visibility?: string
          profile_visibility?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          hiking_styles: string[] | null
          id: string
          location: string | null
          nickname: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          hiking_styles?: string[] | null
          id?: string
          location?: string | null
          nickname?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          hiking_styles?: string[] | null
          id?: string
          location?: string | null
          nickname?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trails: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          distance_km: number
          duration_minutes: number
          elevation_gain_m: number | null
          id: string
          is_popular: boolean
          mountain_id: number
          name: string
          starting_point: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string
          distance_km: number
          duration_minutes: number
          elevation_gain_m?: number | null
          id?: string
          is_popular?: boolean
          mountain_id: number
          name: string
          starting_point: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          distance_km?: number
          duration_minutes?: number
          elevation_gain_m?: number | null
          id?: string
          is_popular?: boolean
          mountain_id?: number
          name?: string
          starting_point?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_plan_participant: {
        Args: { _plan_id: string; _user_id: string }
        Returns: boolean
      }
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
