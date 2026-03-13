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
      activity_feed: {
        Row: {
          created_at: string
          id: string
          message: string
          mountain_id: number | null
          participant_ids: string[] | null
          plan_id: string | null
          shared_completion_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          mountain_id?: number | null
          participant_ids?: string[] | null
          plan_id?: string | null
          shared_completion_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          mountain_id?: number | null
          participant_ids?: string[] | null
          plan_id?: string | null
          shared_completion_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "hiking_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_shared_completion_id_fkey"
            columns: ["shared_completion_id"]
            isOneToOne: false
            referencedRelation: "shared_completions"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          alert_type: string
          category: string
          created_at: string
          date: string
          description: string
          full_description: string
          id: string
          is_active: boolean
          mountain_name: string | null
          severity: string
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          alert_type?: string
          category?: string
          created_at?: string
          date?: string
          description: string
          full_description: string
          id?: string
          is_active?: boolean
          mountain_name?: string | null
          severity?: string
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          category?: string
          created_at?: string
          date?: string
          description?: string
          full_description?: string
          id?: string
          is_active?: boolean
          mountain_name?: string | null
          severity?: string
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          badge_id: string | null
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          goal_type: string
          goal_value: number
          id: string
          level: number
          start_date: string | null
          title: string
          type: string
        }
        Insert: {
          badge_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_type?: string
          goal_value?: number
          id?: string
          level?: number
          start_date?: string | null
          title: string
          type?: string
        }
        Update: {
          badge_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_type?: string
          goal_value?: number
          id?: string
          level?: number
          start_date?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
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
      group_invitations: {
        Row: {
          created_at: string
          group_id: string
          id: string
          invited_by: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          invited_by?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          invited_by?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "hiking_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "hiking_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      hiking_groups: {
        Row: {
          avatar_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
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
          group_id: string | null
          id: string
          invite_code: string
          is_public: boolean
          meeting_location: string | null
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
          group_id?: string | null
          id?: string
          invite_code?: string
          is_public?: boolean
          meeting_location?: string | null
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
          group_id?: string | null
          id?: string
          invite_code?: string
          is_public?: boolean
          meeting_location?: string | null
          mountain_id?: number
          notes?: string | null
          planned_date?: string
          start_time?: string | null
          status?: string
          trail_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiking_plans_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "hiking_groups"
            referencedColumns: ["id"]
          },
        ]
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
          invited_by: string | null
          plan_id: string
          responded_at: string | null
          rsvp_status: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string
          invited_by?: string | null
          plan_id: string
          responded_at?: string | null
          rsvp_status?: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string
          invited_by?: string | null
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
      shared_completion_participants: {
        Row: {
          id: string
          shared_completion_id: string
          user_id: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          id?: string
          shared_completion_id: string
          user_id: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          id?: string
          shared_completion_id?: string
          user_id?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_completion_participants_shared_completion_id_fkey"
            columns: ["shared_completion_id"]
            isOneToOne: false
            referencedRelation: "shared_completions"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_completions: {
        Row: {
          completed_at: string
          created_at: string
          created_by: string
          group_id: string | null
          id: string
          mountain_id: number
          plan_id: string | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          created_by: string
          group_id?: string | null
          id?: string
          mountain_id: number
          plan_id?: string | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          created_by?: string
          group_id?: string | null
          id?: string
          mountain_id?: number
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_completions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "hiking_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_completions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "hiking_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      trails: {
        Row: {
          course_type: string
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
          course_type?: string
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
          course_type?: string
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
      user_achievements: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          id: string
          joined_at: string
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
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
