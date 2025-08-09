export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_based_matches: {
        Row: {
          activity_score_difference: number
          compatibility_score: number
          created_at: string
          id: string
          match_reasoning: Json | null
          status: string
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          activity_score_difference?: number
          compatibility_score?: number
          created_at?: string
          id?: string
          match_reasoning?: Json | null
          status?: string
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          activity_score_difference?: number
          compatibility_score?: number
          created_at?: string
          id?: string
          match_reasoning?: Json | null
          status?: string
          updated_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_based_matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_based_matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_scores: {
        Row: {
          created_at: string
          engagement_score: number
          id: string
          last_calculated_at: string
          login_frequency_score: number
          match_interaction_score: number
          overall_score: number
          recent_activity_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          engagement_score?: number
          id?: string
          last_calculated_at?: string
          login_frequency_score?: number
          match_interaction_score?: number
          overall_score?: number
          recent_activity_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          engagement_score?: number
          id?: string
          last_calculated_at?: string
          login_frequency_score?: number
          match_interaction_score?: number
          overall_score?: number
          recent_activity_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_alerts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          match_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          match_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          match_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_alerts_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_alerts_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
      auth_email_config: {
        Row: {
          created_at: string
          enabled: boolean
          from_email: string | null
          handler_function: string
          id: string
          site_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          from_email?: string | null
          handler_function?: string
          id?: string
          site_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          from_email?: string | null
          handler_function?: string
          id?: string
          site_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      badge_opt_ins: {
        Row: {
          badge_id: string
          created_at: string
          id: string
          notifications_enabled: boolean
          opted_in_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          opted_in_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          opted_in_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_badge_opt_ins_badge_id"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_badge_opt_ins_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          badge_type: string
          created_at: string
          description: string
          icon_name: string | null
          id: string
          name: string
          requirements: Json
          reward_description: string | null
          updated_at: string
        }
        Insert: {
          badge_type?: string
          created_at?: string
          description: string
          icon_name?: string | null
          id?: string
          name: string
          requirements?: Json
          reward_description?: string | null
          updated_at?: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          description?: string
          icon_name?: string | null
          id?: string
          name?: string
          requirements?: Json
          reward_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      beta_users: {
        Row: {
          created_at: string
          features: Database["public"]["Enums"]["beta_feature"][] | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          features?: Database["public"]["Enums"]["beta_feature"][] | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          features?: Database["public"]["Enums"]["beta_feature"][] | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chaos_test_logs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          location: string
          metadata: Json | null
          reproduction_steps: Json
          severity: string
          stack_trace: string | null
          test_session_id: string
          test_type: string
          user_action: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          location: string
          metadata?: Json | null
          reproduction_steps?: Json
          severity: string
          stack_trace?: string | null
          test_session_id: string
          test_type: string
          user_action?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          location?: string
          metadata?: Json | null
          reproduction_steps?: Json
          severity?: string
          stack_trace?: string | null
          test_session_id?: string
          test_type?: string
          user_action?: string | null
        }
        Relationships: []
      }
      chaos_test_sessions: {
        Row: {
          business_insights: Json | null
          completed_at: string | null
          completion_status: string | null
          config: Json
          coverage_percent: number | null
          created_by: string | null
          dead_ends_found: number | null
          errors_found: number | null
          id: string
          performance_issues: number | null
          session_metadata: Json | null
          started_at: string | null
          status: string
          test_duration_seconds: number | null
          total_actions: number | null
          updated_at: string | null
          vulnerabilities_found: number | null
        }
        Insert: {
          business_insights?: Json | null
          completed_at?: string | null
          completion_status?: string | null
          config: Json
          coverage_percent?: number | null
          created_by?: string | null
          dead_ends_found?: number | null
          errors_found?: number | null
          id?: string
          performance_issues?: number | null
          session_metadata?: Json | null
          started_at?: string | null
          status?: string
          test_duration_seconds?: number | null
          total_actions?: number | null
          updated_at?: string | null
          vulnerabilities_found?: number | null
        }
        Update: {
          business_insights?: Json | null
          completed_at?: string | null
          completion_status?: string | null
          config?: Json
          coverage_percent?: number | null
          created_by?: string | null
          dead_ends_found?: number | null
          errors_found?: number | null
          id?: string
          performance_issues?: number | null
          session_metadata?: Json | null
          started_at?: string | null
          status?: string
          test_duration_seconds?: number | null
          total_actions?: number | null
          updated_at?: string | null
          vulnerabilities_found?: number | null
        }
        Relationships: []
      }
      collaboration_goals: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          goal_type: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          goal_type: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          goal_type?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_feature_flags: {
        Row: {
          community_id: string
          created_at: string
          description: string | null
          enabled: boolean
          feature_name: string
          id: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          feature_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          feature_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_feature_flags_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          created_at: string
          deleted_at: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_pacing: {
        Row: {
          community_id: string
          consistent_description: string | null
          created_at: string
          deep_dive_description: string | null
          id: string
          light_description: string | null
          moderate_description: string | null
          updated_at: string
        }
        Insert: {
          community_id: string
          consistent_description?: string | null
          created_at?: string
          deep_dive_description?: string | null
          id?: string
          light_description?: string | null
          moderate_description?: string | null
          updated_at?: string
        }
        Update: {
          community_id?: string
          consistent_description?: string | null
          created_at?: string
          deep_dive_description?: string | null
          id?: string
          light_description?: string | null
          moderate_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_pacing_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: true
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      compass_quartile_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          grow_completed: boolean
          id: string
          learn_completed: boolean
          match_completed: boolean
          progress_percentage: number
          quartile_1: boolean
          quartile_2: boolean
          quartile_3: boolean
          quartile_4: boolean
          talk_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          grow_completed?: boolean
          id?: string
          learn_completed?: boolean
          match_completed?: boolean
          progress_percentage?: number
          quartile_1?: boolean
          quartile_2?: boolean
          quartile_3?: boolean
          quartile_4?: boolean
          talk_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          grow_completed?: boolean
          id?: string
          learn_completed?: boolean
          match_completed?: boolean
          progress_percentage?: number
          quartile_1?: boolean
          quartile_2?: boolean
          quartile_3?: boolean
          quartile_4?: boolean
          talk_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      core_flow_test_executions: {
        Row: {
          completed_at: string | null
          created_by: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          results: Json | null
          started_at: string
          status: string
          test_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_by?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          results?: Json | null
          started_at?: string
          status: string
          test_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_by?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          results?: Json | null
          started_at?: string
          status?: string
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "core_flow_test_executions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "core_flow_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      core_flow_tests: {
        Row: {
          created_at: string
          critical: boolean
          description: string | null
          enabled: boolean
          id: string
          last_duration_ms: number | null
          last_error_message: string | null
          last_run_at: string | null
          last_status: string | null
          success_rate: number | null
          test_name: string
          test_script: Json
          test_type: string
          total_runs: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          critical?: boolean
          description?: string | null
          enabled?: boolean
          id?: string
          last_duration_ms?: number | null
          last_error_message?: string | null
          last_run_at?: string | null
          last_status?: string | null
          success_rate?: number | null
          test_name: string
          test_script?: Json
          test_type: string
          total_runs?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          critical?: boolean
          description?: string | null
          enabled?: boolean
          id?: string
          last_duration_ms?: number | null
          last_error_message?: string | null
          last_run_at?: string | null
          last_status?: string | null
          success_rate?: number | null
          test_name?: string
          test_script?: Json
          test_type?: string
          total_runs?: number
          updated_at?: string
        }
        Relationships: []
      }
      crew_members: {
        Row: {
          crew_id: string
          id: string
          is_lead: boolean
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          crew_id: string
          id?: string
          is_lead?: boolean
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          crew_id?: string
          id?: string
          is_lead?: boolean
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_members_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_tools: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          icon_name: string | null
          id: string
          metadata: Json | null
          name: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          icon_name?: string | null
          id?: string
          metadata?: Json | null
          name: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["email_account_type"]
          created_at: string | null
          from_email: string
          from_name: string
          id: string
          is_default: boolean | null
          reply_to_email: string | null
          updated_at: string | null
        }
        Insert: {
          account_type: Database["public"]["Enums"]["email_account_type"]
          created_at?: string | null
          from_email: string
          from_name: string
          id?: string
          is_default?: boolean | null
          reply_to_email?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["email_account_type"]
          created_at?: string | null
          from_email?: string
          from_name?: string
          id?: string
          is_default?: boolean | null
          reply_to_email?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_header_footer_templates: {
        Row: {
          account_type: Database["public"]["Enums"]["email_account_type"]
          created_at: string | null
          html_content: string
          id: string
          is_default: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["email_account_type"]
          created_at?: string | null
          html_content: string
          id?: string
          is_default?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["email_account_type"]
          created_at?: string | null
          html_content?: string
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_send_logs: {
        Row: {
          account_type: Database["public"]["Enums"]["email_account_type"] | null
          created_at: string | null
          error_message: string | null
          id: string
          recipient_email: string
          rendered_html: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          variables_used: Json | null
        }
        Insert: {
          account_type?:
            | Database["public"]["Enums"]["email_account_type"]
            | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          rendered_html?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          variables_used?: Json | null
        }
        Update: {
          account_type?:
            | Database["public"]["Enums"]["email_account_type"]
            | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          rendered_html?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          variables_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_send_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          account_type: Database["public"]["Enums"]["email_account_type"] | null
          body_html: string
          created_at: string | null
          created_by: string | null
          description: string | null
          footer_html: string | null
          footer_template_id: string | null
          header_html: string | null
          header_template_id: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["template_status"] | null
          subject: string
          template_key: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          account_type?:
            | Database["public"]["Enums"]["email_account_type"]
            | null
          body_html: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          footer_html?: string | null
          footer_template_id?: string | null
          header_html?: string | null
          header_template_id?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["template_status"] | null
          subject: string
          template_key: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          account_type?:
            | Database["public"]["Enums"]["email_account_type"]
            | null
          body_html?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          footer_html?: string | null
          footer_template_id?: string | null
          header_html?: string | null
          header_template_id?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["template_status"] | null
          subject?: string
          template_key?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_footer_template_id_fkey"
            columns: ["footer_template_id"]
            isOneToOne: false
            referencedRelation: "email_header_footer_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_header_template_id_fkey"
            columns: ["header_template_id"]
            isOneToOne: false
            referencedRelation: "email_header_footer_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_logs: {
        Row: {
          community_id: string
          created_at: string
          engagement_type: string
          id: string
          metadata: Json | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          community_id: string
          created_at?: string
          engagement_type: string
          id?: string
          metadata?: Json | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          community_id?: string
          created_at?: string
          engagement_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagement_logs_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_stats: {
        Row: {
          community_id: string | null
          completed_sessions: number
          created_at: string
          current_streak: number
          id: string
          last_engagement_date: string | null
          planned_sessions: number
          updated_at: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          community_id?: string | null
          completed_sessions?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_engagement_date?: string | null
          planned_sessions?: number
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          community_id?: string | null
          completed_sessions?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_engagement_date?: string | null
          planned_sessions?: number
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagement_stats_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_transcript_analysis: {
        Row: {
          analysis_version: string | null
          created_at: string | null
          emotional_sentiment: Json | null
          engagement_patterns: Json | null
          expertise_indicators: Json | null
          id: string
          learning_moments: Json | null
          personality_traits: Json | null
          semantic_topics: Json | null
          transcript_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_version?: string | null
          created_at?: string | null
          emotional_sentiment?: Json | null
          engagement_patterns?: Json | null
          expertise_indicators?: Json | null
          id?: string
          learning_moments?: Json | null
          personality_traits?: Json | null
          semantic_topics?: Json | null
          transcript_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_version?: string | null
          created_at?: string | null
          emotional_sentiment?: Json | null
          engagement_patterns?: Json | null
          expertise_indicators?: Json | null
          id?: string
          learning_moments?: Json | null
          personality_traits?: Json | null
          semantic_topics?: Json | null
          transcript_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      global_feature_flags: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          enabled: boolean
          feature_name: string
          id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          enabled?: boolean
          feature_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          enabled?: boolean
          feature_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      hat_detections: {
        Row: {
          confidence: number | null
          created_at: string
          hat_name: string
          id: string
          metadata: Json | null
          session_id: string | null
          source: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          hat_name: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          hat_name?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hat_detections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hat_embeddings: {
        Row: {
          created_at: string | null
          embedding: string | null
          hat_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          hat_name: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          hat_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hat_inference_requests: {
        Row: {
          created_at: string | null
          id: string
          original_hat: string
          result: string | null
          session_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_hat: string
          result?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          original_hat?: string
          result?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hat_inference_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hat_metadata: {
        Row: {
          confidence: number | null
          created_at: string | null
          hat_name: string
          id: string
          session_id: string | null
          source: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          hat_name: string
          id?: string
          session_id?: string | null
          source?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          hat_name?: string
          id?: string
          session_id?: string | null
          source?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hat_metadata_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hat_similarity_cache: {
        Row: {
          created_at: string | null
          hat1: string
          hat2: string
          similarity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hat1: string
          hat2: string
          similarity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hat1?: string
          hat2?: string
          similarity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      idea_massage_prompts: {
        Row: {
          ai_response: string
          created_at: string
          id: string
          original_content: string
          saved_item_id: string
          updated_at: string
          user_id: string
          user_prompt: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          id?: string
          original_content: string
          saved_item_id: string
          updated_at?: string
          user_id: string
          user_prompt: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          id?: string
          original_content?: string
          saved_item_id?: string
          updated_at?: string
          user_id?: string
          user_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_massage_prompts_saved_item_id_fkey"
            columns: ["saved_item_id"]
            isOneToOne: false
            referencedRelation: "saved_items"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_reminder_logs: {
        Row: {
          id: string
          notification_id: string | null
          reminder_type: string
          sent_at: string | null
          stage: string
          success: boolean | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          notification_id?: string | null
          reminder_type: string
          sent_at?: string | null
          stage: string
          success?: boolean | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string | null
          reminder_type?: string
          sent_at?: string | null
          stage?: string
          success?: boolean | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_reminder_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "journey_reminder_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_reminder_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_reminder_templates: {
        Row: {
          active: boolean | null
          bypass_template: boolean | null
          content: string
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          email_template_id: string | null
          id: string
          reminder_type: string
          stage: string
          subject: string
          template_variables: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          bypass_template?: boolean | null
          content: string
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          email_template_id?: string | null
          id?: string
          reminder_type: string
          stage: string
          subject: string
          template_variables?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          bypass_template?: boolean | null
          content?: string
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          email_template_id?: string | null
          id?: string
          reminder_type?: string
          stage?: string
          subject?: string
          template_variables?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_reminder_templates_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_stage_config: {
        Row: {
          color: string | null
          color_scheme: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          display_name: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          label: string | null
          stage: string
          updated_at: string
          value: string | null
        }
        Insert: {
          color?: string | null
          color_scheme?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_name?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          label?: string | null
          stage: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          color?: string | null
          color_scheme?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_name?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          label?: string | null
          stage?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          created_at: string
          id: string
          last_practiced_at: string
          sessions_completed: number
          total_duration_minutes: number
          updated_at: string
          user_id: string
          webrtc_concept: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_practiced_at?: string
          sessions_completed?: number
          total_duration_minutes?: number
          updated_at?: string
          user_id: string
          webrtc_concept: string
        }
        Update: {
          created_at?: string
          id?: string
          last_practiced_at?: string
          sessions_completed?: number
          total_duration_minutes?: number
          updated_at?: string
          user_id?: string
          webrtc_concept?: string
        }
        Relationships: []
      }
      load_test_configurations: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          duration_seconds: number
          headers: Json | null
          id: string
          name: string
          ramp_up_seconds: number
          target_url: string
          test_scenario: Json
          updated_at: string
          virtual_users: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          duration_seconds?: number
          headers?: Json | null
          id?: string
          name: string
          ramp_up_seconds?: number
          target_url: string
          test_scenario?: Json
          updated_at?: string
          virtual_users?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          duration_seconds?: number
          headers?: Json | null
          id?: string
          name?: string
          ramp_up_seconds?: number
          target_url?: string
          test_scenario?: Json
          updated_at?: string
          virtual_users?: number
        }
        Relationships: []
      }
      load_test_executions: {
        Row: {
          average_response_time: number | null
          completed_at: string | null
          configuration_id: string | null
          created_at: string
          created_by: string
          duration_seconds: number | null
          error_details: Json | null
          error_rate: number | null
          failed_requests: number | null
          id: string
          max_response_time: number | null
          min_response_time: number | null
          performance_metrics: Json | null
          requests_per_second: number | null
          results_data: Json | null
          started_at: string | null
          status: string
          successful_requests: number | null
          total_requests: number | null
          updated_at: string
        }
        Insert: {
          average_response_time?: number | null
          completed_at?: string | null
          configuration_id?: string | null
          created_at?: string
          created_by: string
          duration_seconds?: number | null
          error_details?: Json | null
          error_rate?: number | null
          failed_requests?: number | null
          id?: string
          max_response_time?: number | null
          min_response_time?: number | null
          performance_metrics?: Json | null
          requests_per_second?: number | null
          results_data?: Json | null
          started_at?: string | null
          status?: string
          successful_requests?: number | null
          total_requests?: number | null
          updated_at?: string
        }
        Update: {
          average_response_time?: number | null
          completed_at?: string | null
          configuration_id?: string | null
          created_at?: string
          created_by?: string
          duration_seconds?: number | null
          error_details?: Json | null
          error_rate?: number | null
          failed_requests?: number | null
          id?: string
          max_response_time?: number | null
          min_response_time?: number | null
          performance_metrics?: Json | null
          requests_per_second?: number | null
          results_data?: Json | null
          started_at?: string | null
          status?: string
          successful_requests?: number | null
          total_requests?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "load_test_executions_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "load_test_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      load_test_metrics: {
        Row: {
          active_users: number
          cpu_usage: number | null
          custom_metrics: Json | null
          error_count: number | null
          execution_id: string | null
          id: string
          memory_usage: number | null
          network_io: Json | null
          requests_per_second: number | null
          response_time: number | null
          timestamp_recorded: string
        }
        Insert: {
          active_users: number
          cpu_usage?: number | null
          custom_metrics?: Json | null
          error_count?: number | null
          execution_id?: string | null
          id?: string
          memory_usage?: number | null
          network_io?: Json | null
          requests_per_second?: number | null
          response_time?: number | null
          timestamp_recorded?: string
        }
        Update: {
          active_users?: number
          cpu_usage?: number | null
          custom_metrics?: Json | null
          error_count?: number | null
          execution_id?: string | null
          id?: string
          memory_usage?: number | null
          network_io?: Json | null
          requests_per_second?: number | null
          response_time?: number | null
          timestamp_recorded?: string
        }
        Relationships: [
          {
            foreignKeyName: "load_test_metrics_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "load_test_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      match_admin_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_admin_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_admin_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
        ]
      }
      match_conversation_analysis: {
        Row: {
          analysis_type: Database["public"]["Enums"]["match_analysis_type"]
          content: string
          created_at: string
          id: string
          match_id: string
          updated_at: string
        }
        Insert: {
          analysis_type: Database["public"]["Enums"]["match_analysis_type"]
          content: string
          created_at?: string
          id?: string
          match_id: string
          updated_at?: string
        }
        Update: {
          analysis_type?: Database["public"]["Enums"]["match_analysis_type"]
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_conversation_analysis_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_conversation_analysis_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
        ]
      }
      match_meeting_times: {
        Row: {
          created_at: string
          detected_time: string
          id: string
          match_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detected_time: string
          id?: string
          match_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detected_time?: string
          id?: string
          match_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_meeting_times_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_meeting_times_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
        ]
      }
      match_pools: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_emails: string[]
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_emails?: string[]
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_emails?: string[]
        }
        Relationships: []
      }
      match_scheduling_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
          sender_type: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          sender_id: string
          sender_type?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_id?: string
          sender_type?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_scheduling_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scheduling_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "match_scheduling_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_suggestions: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          match_reason: string
          pool_id: string
          status: string
          transcript_analysis: Json | null
          user1_email: string
          user1_id: string | null
          user2_email: string
          user2_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          match_reason: string
          pool_id: string
          status?: string
          transcript_analysis?: Json | null
          user1_email: string
          user1_id?: string | null
          user2_email: string
          user2_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          match_reason?: string
          pool_id?: string
          status?: string
          transcript_analysis?: Json | null
          user1_email?: string
          user1_id?: string | null
          user2_email?: string
          user2_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_suggestions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "match_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      match_user_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_user_notes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_user_notes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "match_user_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string
          created_by: string
          email_sent_at: string | null
          id: string
          rationale: string
          status: string
          upduo_session_id: string | null
          upduo_session_name: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by: string
          email_sent_at?: string | null
          id?: string
          rationale: string
          status?: string
          upduo_session_id?: string | null
          upduo_session_name?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string
          email_sent_at?: string | null
          id?: string
          rationale?: string
          status?: string
          upduo_session_id?: string | null
          upduo_session_name?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_logs: {
        Row: {
          attempt_count: number
          channel: string
          created_at: string
          error: string | null
          id: string
          last_attempt_at: string
          notification_id: string
          source_table: string
          success: boolean
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          channel: string
          created_at?: string
          error?: string | null
          id?: string
          last_attempt_at?: string
          notification_id: string
          source_table?: string
          success?: boolean
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          last_attempt_at?: string
          notification_id?: string
          source_table?: string
          success?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channels: Json | null
          content: string
          created_at: string | null
          data: Json | null
          deduplication_key: string | null
          error: string | null
          id: string
          priority: string
          processed_at: string | null
          read: boolean | null
          status: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channels?: Json | null
          content: string
          created_at?: string | null
          data?: Json | null
          deduplication_key?: string | null
          error?: string | null
          id?: string
          priority?: string
          processed_at?: string | null
          read?: boolean | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channels?: Json | null
          content?: string
          created_at?: string | null
          data?: Json | null
          deduplication_key?: string | null
          error?: string | null
          id?: string
          priority?: string
          processed_at?: string | null
          read?: boolean | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_match_announcements: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          scheduled_for: string
          status: string
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          scheduled_for: string
          status?: string
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          scheduled_for?: string
          status?: string
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_match_announcements_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_match_announcements_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
        ]
      }
      pending_notifications: {
        Row: {
          channel: string
          content: string
          created_at: string | null
          data: Json | null
          id: string
          notification_type: string
          processed_at: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          channel: string
          content: string
          created_at?: string | null
          data?: Json | null
          id?: string
          notification_type: string
          processed_at?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          notification_type?: string
          processed_at?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_budgets: {
        Row: {
          budget_value: number
          created_at: string
          enabled: boolean | null
          id: string
          metric_name: string
          page_path: string
          severity: string
          unit: string
          updated_at: string
        }
        Insert: {
          budget_value: number
          created_at?: string
          enabled?: boolean | null
          id?: string
          metric_name: string
          page_path: string
          severity?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          budget_value?: number
          created_at?: string
          enabled?: boolean | null
          id?: string
          metric_name?: string
          page_path?: string
          severity?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_visibility: {
        Row: {
          created_at: string
          created_by: string
          hidden_from_community_ids: string[] | null
          hidden_from_user_ids: string[] | null
          id: string
          post_id: string
          updated_at: string
          visibility_type: string
          visible_to_community_ids: string[] | null
          visible_to_user_ids: string[] | null
        }
        Insert: {
          created_at?: string
          created_by: string
          hidden_from_community_ids?: string[] | null
          hidden_from_user_ids?: string[] | null
          id?: string
          post_id: string
          updated_at?: string
          visibility_type: string
          visible_to_community_ids?: string[] | null
          visible_to_user_ids?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string
          hidden_from_community_ids?: string[] | null
          hidden_from_user_ids?: string[] | null
          id?: string
          post_id?: string
          updated_at?: string
          visibility_type?: string
          visible_to_community_ids?: string[] | null
          visible_to_user_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "post_visibility_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          experiment_id: string | null
          generated_idea: string | null
          id: string
          image_url: string | null
          match_id: string | null
          metadata: Json | null
          status: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          experiment_id?: string | null
          generated_idea?: string | null
          id?: string
          image_url?: string | null
          match_id?: string | null
          metadata?: Json | null
          status?: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          experiment_id?: string | null
          generated_idea?: string | null
          id?: string
          image_url?: string | null
          match_id?: string | null
          metadata?: Json | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_posts_match_id"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_posts_match_id"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "posts_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "profile_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      process_gaps: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          status: Database["public"]["Enums"]["gap_status"] | null
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          status?: Database["public"]["Enums"]["gap_status"] | null
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["gap_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_gaps_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_gaps_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_experiments: {
        Row: {
          analyzed_transcript: string | null
          caution_areas: string[] | null
          confidence_score: number | null
          created_at: string
          created_by: string | null
          excitement_areas: string[] | null
          experiment_type: string
          id: string
          is_deleted: boolean
          is_second_opinion: boolean | null
          learning_focus: string[] | null
          moment_of_brilliance: string | null
          primary_flow_activity: string | null
          source_type: string
          stance_statement: string | null
          status: string
          suggested_hats: string[] | null
          teaching_focus: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analyzed_transcript?: string | null
          caution_areas?: string[] | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          excitement_areas?: string[] | null
          experiment_type?: string
          id?: string
          is_deleted?: boolean
          is_second_opinion?: boolean | null
          learning_focus?: string[] | null
          moment_of_brilliance?: string | null
          primary_flow_activity?: string | null
          source_type: string
          stance_statement?: string | null
          status?: string
          suggested_hats?: string[] | null
          teaching_focus?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analyzed_transcript?: string | null
          caution_areas?: string[] | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          excitement_areas?: string[] | null
          experiment_type?: string
          id?: string
          is_deleted?: boolean
          is_second_opinion?: boolean | null
          learning_focus?: string[] | null
          moment_of_brilliance?: string | null
          primary_flow_activity?: string | null
          source_type?: string
          stance_statement?: string | null
          status?: string
          suggested_hats?: string[] | null
          teaching_focus?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_experiments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_flow_activity: string | null
          approved_stance: string | null
          avatar_url: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          deleted_at: string | null
          email: string
          email_preferences: Json | null
          first_name: string | null
          has_completed_reflection: boolean | null
          has_partial_reflection: boolean | null
          id: string
          impersonating_user_id: string | null
          journey_stage: string | null
          journey_start_date: string | null
          last_name: string | null
          location: string | null
          metadata: Json | null
          notification_preferences: Json | null
          onboarding_completed: boolean
          phone_number: string | null
          phone_verification_code: string | null
          phone_verification_sent_at: string | null
          phone_verified: boolean | null
          primary_flow_activity: string | null
          reflection_quality_score: number | null
          status: string
          subject_statuses: Json[] | null
          subjects: string[] | null
          teaching_experience: string | null
          updated_at: string
          upduo_error: string | null
          upduo_id: string | null
          upduo_status: string | null
          upduo_sync_at: string | null
        }
        Insert: {
          approved_flow_activity?: string | null
          approved_stance?: string | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          deleted_at?: string | null
          email: string
          email_preferences?: Json | null
          first_name?: string | null
          has_completed_reflection?: boolean | null
          has_partial_reflection?: boolean | null
          id: string
          impersonating_user_id?: string | null
          journey_stage?: string | null
          journey_start_date?: string | null
          last_name?: string | null
          location?: string | null
          metadata?: Json | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean
          phone_number?: string | null
          phone_verification_code?: string | null
          phone_verification_sent_at?: string | null
          phone_verified?: boolean | null
          primary_flow_activity?: string | null
          reflection_quality_score?: number | null
          status?: string
          subject_statuses?: Json[] | null
          subjects?: string[] | null
          teaching_experience?: string | null
          updated_at?: string
          upduo_error?: string | null
          upduo_id?: string | null
          upduo_status?: string | null
          upduo_sync_at?: string | null
        }
        Update: {
          approved_flow_activity?: string | null
          approved_stance?: string | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          email_preferences?: Json | null
          first_name?: string | null
          has_completed_reflection?: boolean | null
          has_partial_reflection?: boolean | null
          id?: string
          impersonating_user_id?: string | null
          journey_stage?: string | null
          journey_start_date?: string | null
          last_name?: string | null
          location?: string | null
          metadata?: Json | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean
          phone_number?: string | null
          phone_verification_code?: string | null
          phone_verification_sent_at?: string | null
          phone_verified?: boolean | null
          primary_flow_activity?: string | null
          reflection_quality_score?: number | null
          status?: string
          subject_statuses?: Json[] | null
          subjects?: string[] | null
          teaching_experience?: string | null
          updated_at?: string
          upduo_error?: string | null
          upduo_id?: string | null
          upduo_status?: string | null
          upduo_sync_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_impersonating_user_id_fkey"
            columns: ["impersonating_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_items: {
        Row: {
          alignment_level: number | null
          content: string
          created_at: string
          excitement_level: number | null
          id: string
          original_post_id: string | null
          type: Database["public"]["Enums"]["saved_item_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          alignment_level?: number | null
          content: string
          created_at?: string
          excitement_level?: number | null
          id?: string
          original_post_id?: string | null
          type: Database["public"]["Enums"]["saved_item_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          alignment_level?: number | null
          content?: string
          created_at?: string
          excitement_level?: number | null
          id?: string
          original_post_id?: string | null
          type?: Database["public"]["Enums"]["saved_item_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      session_completions: {
        Row: {
          completed_at: string
          confidence_score: number | null
          created_at: string
          id: string
          journey_stage_after: string | null
          journey_stage_before: string | null
          match_id: string | null
          metadata: Json | null
          next_session_prompted_at: string | null
          next_session_scheduled: boolean | null
          session_id: string
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          journey_stage_after?: string | null
          journey_stage_before?: string | null
          match_id?: string | null
          metadata?: Json | null
          next_session_prompted_at?: string | null
          next_session_scheduled?: boolean | null
          session_id: string
          session_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          journey_stage_after?: string | null
          journey_stage_before?: string | null
          match_id?: string | null
          metadata?: Json | null
          next_session_prompted_at?: string | null
          next_session_scheduled?: boolean | null
          session_id?: string
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_invitations: {
        Row: {
          created_at: string
          created_by: string
          current_uses: number
          expires_at: string | null
          id: string
          invite_code: string
          is_active: boolean
          max_uses: number | null
          session_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          invite_code: string
          is_active?: boolean
          max_uses?: number | null
          session_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean
          max_uses?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_invitations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "webrtc_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          agora_uid: number
          id: string
          joined_at: string
          left_at: string | null
          role: string
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          agora_uid: number
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          session_id: string
          status?: string
          user_id: string
        }
        Update: {
          agora_uid?: number
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "webrtc_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      signup_transaction_logs: {
        Row: {
          created_at: string
          data: Json | null
          email: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          status: string
          step: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          email: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          status: string
          step: string
          transaction_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          email?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          status?: string
          step?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: []
      }
      sponsorships: {
        Row: {
          created_at: string
          district: string
          id: string
          region: string
          scheduler_link: string | null
          status: string
          store: string
          tool_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          district: string
          id?: string
          region: string
          scheduler_link?: string | null
          status?: string
          store: string
          tool_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          district?: string
          id?: string
          region?: string
          scheduler_link?: string | null
          status?: string
          store?: string
          tool_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_success_signs: {
        Row: {
          confidence_level: number
          created_at: string
          description: string
          detected_by: string | null
          detection_method: string
          evidence_text: string | null
          id: string
          metadata: Json | null
          session_timestamp: string | null
          sign_type: string
          student_id: string
          transcript_id: string | null
          updated_at: string
        }
        Insert: {
          confidence_level?: number
          created_at?: string
          description: string
          detected_by?: string | null
          detection_method?: string
          evidence_text?: string | null
          id?: string
          metadata?: Json | null
          session_timestamp?: string | null
          sign_type: string
          student_id: string
          transcript_id?: string | null
          updated_at?: string
        }
        Update: {
          confidence_level?: number
          created_at?: string
          description?: string
          detected_by?: string | null
          detection_method?: string
          evidence_text?: string | null
          id?: string
          metadata?: Json | null
          session_timestamp?: string | null
          sign_type?: string
          student_id?: string
          transcript_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_success_signs_detected_by_fkey"
            columns: ["detected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_success_signs_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["transcript_id"]
          },
          {
            foreignKeyName: "student_success_signs_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "upduo_transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      synthetic_check_results: {
        Row: {
          assertions_failed: number | null
          assertions_passed: number | null
          check_time: string
          error_message: string | null
          id: string
          location: string | null
          metadata: Json | null
          monitor_id: string | null
          response_body: string | null
          response_code: number | null
          response_time_ms: number | null
          status: string
        }
        Insert: {
          assertions_failed?: number | null
          assertions_passed?: number | null
          check_time?: string
          error_message?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          monitor_id?: string | null
          response_body?: string | null
          response_code?: number | null
          response_time_ms?: number | null
          status: string
        }
        Update: {
          assertions_failed?: number | null
          assertions_passed?: number | null
          check_time?: string
          error_message?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          monitor_id?: string | null
          response_body?: string | null
          response_code?: number | null
          response_time_ms?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "synthetic_check_results_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "synthetic_monitoring"
            referencedColumns: ["id"]
          },
        ]
      }
      synthetic_monitoring: {
        Row: {
          assertions: Json
          check_frequency: number
          consecutive_failures: number | null
          created_at: string
          enabled: boolean | null
          expected_response_time_ms: number | null
          id: string
          last_check_at: string | null
          last_status: string | null
          locations: string[] | null
          monitor_name: string
          monitor_type: string
          target_url: string
          timeout_ms: number | null
          updated_at: string
        }
        Insert: {
          assertions?: Json
          check_frequency?: number
          consecutive_failures?: number | null
          created_at?: string
          enabled?: boolean | null
          expected_response_time_ms?: number | null
          id?: string
          last_check_at?: string | null
          last_status?: string | null
          locations?: string[] | null
          monitor_name: string
          monitor_type: string
          target_url: string
          timeout_ms?: number | null
          updated_at?: string
        }
        Update: {
          assertions?: Json
          check_frequency?: number
          consecutive_failures?: number | null
          created_at?: string
          enabled?: boolean | null
          expected_response_time_ms?: number | null
          id?: string
          last_check_at?: string | null
          last_status?: string | null
          locations?: string[] | null
          monitor_name?: string
          monitor_type?: string
          target_url?: string
          timeout_ms?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      test_execution_results: {
        Row: {
          accessibility_violations: Json | null
          created_at: string
          device_info: Json | null
          duration_ms: number | null
          end_time: string | null
          error_details: Json | null
          execution_id: string | null
          id: string
          network_conditions: Json | null
          performance_data: Json | null
          scenario_id: string | null
          screenshots: Json | null
          start_time: string
          status: string
          user_actions: Json | null
        }
        Insert: {
          accessibility_violations?: Json | null
          created_at?: string
          device_info?: Json | null
          duration_ms?: number | null
          end_time?: string | null
          error_details?: Json | null
          execution_id?: string | null
          id?: string
          network_conditions?: Json | null
          performance_data?: Json | null
          scenario_id?: string | null
          screenshots?: Json | null
          start_time?: string
          status?: string
          user_actions?: Json | null
        }
        Update: {
          accessibility_violations?: Json | null
          created_at?: string
          device_info?: Json | null
          duration_ms?: number | null
          end_time?: string | null
          error_details?: Json | null
          execution_id?: string | null
          id?: string
          network_conditions?: Json | null
          performance_data?: Json | null
          scenario_id?: string | null
          screenshots?: Json | null
          start_time?: string
          status?: string
          user_actions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "test_execution_results_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "test_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      test_scenarios: {
        Row: {
          created_at: string
          enabled: boolean | null
          environment: string | null
          expected_outcomes: Json
          id: string
          priority: string
          scenario_name: string
          scenario_type: string
          tags: string[] | null
          test_steps: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          environment?: string | null
          expected_outcomes?: Json
          id?: string
          priority?: string
          scenario_name: string
          scenario_type: string
          tags?: string[] | null
          test_steps?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          environment?: string | null
          expected_outcomes?: Json
          id?: string
          priority?: string
          scenario_name?: string
          scenario_type?: string
          tags?: string[] | null
          test_steps?: Json
          updated_at?: string
        }
        Relationships: []
      }
      tool_recommendations: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          recommended_by: string
          recommended_to: string
          status: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          recommended_by: string
          recommended_to: string
          status?: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          recommended_by?: string
          recommended_to?: string
          status?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_recommendations_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          metadata: Json | null
          rating: number | null
          status: string
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          rating?: number | null
          status?: string
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          rating?: number | null
          status?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_reviews_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price_per_month: number | null
          status: string
          type: Database["public"]["Enums"]["tool_type"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price_per_month?: number | null
          status?: string
          type: Database["public"]["Enums"]["tool_type"]
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price_per_month?: number | null
          status?: string
          type?: Database["public"]["Enums"]["tool_type"]
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      touchpoint_analyses: {
        Row: {
          analysis_data: Json
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          match_id: string
          status: string
          updated_at: string
        }
        Insert: {
          analysis_data?: Json
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          match_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          match_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "touchpoint_analyses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "touchpoint_analyses_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "touchpoint_analyses_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
        ]
      }
      touchpoint_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          touchpoint_analysis_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          touchpoint_analysis_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          touchpoint_analysis_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "touchpoint_chat_messages_touchpoint_analysis_id_fkey"
            columns: ["touchpoint_analysis_id"]
            isOneToOne: false
            referencedRelation: "touchpoint_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      upduo_integration_logs: {
        Row: {
          attempt_timestamp: string | null
          created_at: string | null
          crew_code: string | null
          email: string
          error_message: string | null
          id: string
          success: boolean
          user_id: string
        }
        Insert: {
          attempt_timestamp?: string | null
          created_at?: string | null
          crew_code?: string | null
          email: string
          error_message?: string | null
          id?: string
          success?: boolean
          user_id: string
        }
        Update: {
          attempt_timestamp?: string | null
          created_at?: string | null
          crew_code?: string | null
          email?: string
          error_message?: string | null
          id?: string
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      upduo_integration_queue: {
        Row: {
          attempts: number
          created_at: string
          crew_code: string | null
          email: string
          error_message: string | null
          first_name: string | null
          id: string
          last_name: string | null
          max_attempts: number
          metadata: Json | null
          next_retry_at: string | null
          priority: number
          processed_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          crew_code?: string | null
          email: string
          error_message?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          max_attempts?: number
          metadata?: Json | null
          next_retry_at?: string | null
          priority?: number
          processed_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          crew_code?: string | null
          email?: string
          error_message?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          max_attempts?: number
          metadata?: Json | null
          next_retry_at?: string | null
          priority?: number
          processed_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      upduo_session_associations: {
        Row: {
          association_method: string
          confidence_score: number | null
          created_at: string
          id: string
          mapping_id: string | null
          session_id: string
          sideby_user_id: string
          upduo_user_id: string
          verified: boolean | null
        }
        Insert: {
          association_method: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          mapping_id?: string | null
          session_id: string
          sideby_user_id: string
          upduo_user_id: string
          verified?: boolean | null
        }
        Update: {
          association_method?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          mapping_id?: string | null
          session_id?: string
          sideby_user_id?: string
          upduo_user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "upduo_session_associations_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "upduo_user_mappings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upduo_session_associations_sideby_user_id_fkey"
            columns: ["sideby_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      upduo_session_schedules: {
        Row: {
          description: string
          frequency: string
          id: string
          pacing_level: Database["public"]["Enums"]["pacing_level"]
        }
        Insert: {
          description: string
          frequency: string
          id?: string
          pacing_level: Database["public"]["Enums"]["pacing_level"]
        }
        Update: {
          description?: string
          frequency?: string
          id?: string
          pacing_level?: Database["public"]["Enums"]["pacing_level"]
        }
        Relationships: []
      }
      upduo_transcripts: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          quality_score: number | null
          self_reported_match_id: string | null
          session_duration: number | null
          session_ended_at: string | null
          session_started_at: string | null
          transcript: Json
          updated_at: string
          user_id: string | null
          video_session_id: string | null
          word_count: number | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          quality_score?: number | null
          self_reported_match_id?: string | null
          session_duration?: number | null
          session_ended_at?: string | null
          session_started_at?: string | null
          transcript: Json
          updated_at?: string
          user_id?: string | null
          video_session_id?: string | null
          word_count?: number | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          quality_score?: number | null
          self_reported_match_id?: string | null
          session_duration?: number | null
          session_ended_at?: string | null
          session_started_at?: string | null
          transcript?: Json
          updated_at?: string
          user_id?: string | null
          video_session_id?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "upduo_transcripts_self_reported_match_id_fkey"
            columns: ["self_reported_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upduo_transcripts_self_reported_match_id_fkey"
            columns: ["self_reported_match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "upduo_transcripts_video_session_id_fkey"
            columns: ["video_session_id"]
            isOneToOne: false
            referencedRelation: "video_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      upduo_user_associations: {
        Row: {
          created_at: string
          id: string
          sideby_user_id: string
          updated_at: string
          upduo_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sideby_user_id: string
          updated_at?: string
          upduo_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sideby_user_id?: string
          updated_at?: string
          upduo_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upduo_user_associations_sideby_user_id_fkey"
            columns: ["sideby_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      upduo_user_mappings: {
        Row: {
          confidence_score: number | null
          created_at: string
          created_by: string | null
          id: string
          mapping_method: string
          sideby_user_id: string
          updated_at: string
          upduo_first_name: string | null
          upduo_last_name: string | null
          upduo_user_id: string
          verified: boolean | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          mapping_method?: string
          sideby_user_id: string
          updated_at?: string
          upduo_first_name?: string | null
          upduo_last_name?: string | null
          upduo_user_id: string
          verified?: boolean | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          mapping_method?: string
          sideby_user_id?: string
          updated_at?: string
          upduo_first_name?: string | null
          upduo_last_name?: string | null
          upduo_user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "upduo_user_mappings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upduo_user_mappings_sideby_user_id_fkey"
            columns: ["sideby_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_account_creation: {
        Row: {
          created_at: string
          creation_time: string
          id: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          creation_time?: string
          id?: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          creation_time?: string
          id?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      user_availability: {
        Row: {
          created_at: string
          id: string
          pacing_level: string | null
          time_slots: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pacing_level?: string | null
          time_slots?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pacing_level?: string | null
          time_slots?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          created_at: string
          id: string
          is_completed: boolean | null
          metadata: Json | null
          progress: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          progress?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          progress?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_tools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          type: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          type?: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          type?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_flow_activities: {
        Row: {
          confidence: number | null
          created_at: string | null
          flow_activity: string | null
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          flow_activity?: string | null
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          flow_activity?: string | null
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flow_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_events: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          new_stage: string
          previous_stage: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_stage: string
          previous_stage?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_stage?: string
          previous_stage?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pacing_preferences: {
        Row: {
          community_id: string
          created_at: string
          deleted_at: string | null
          id: string
          pacing_level: string
          session_time: Database["public"]["Enums"]["session_time"] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          pacing_level?: string
          session_time?: Database["public"]["Enums"]["session_time"] | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          pacing_level?: string
          session_time?: Database["public"]["Enums"]["session_time"] | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pacing_preferences_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pacing_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          created_at: string
          current_session_id: string | null
          id: string
          last_seen: string
          match_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_session_id?: string | null
          id?: string
          last_seen?: string
          match_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_session_id?: string | null
          id?: string
          last_seen?: string
          match_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reflections: {
        Row: {
          created_at: string
          id: string
          reflection_start: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          reflection_start?: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          reflection_start?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          community_id: string
          created_at: string
          deleted_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_session_schedules: {
        Row: {
          created_at: string
          frequency: Database["public"]["Enums"]["session_frequency"]
          id: string
          start_week: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency: Database["public"]["Enums"]["session_frequency"]
          id?: string
          start_week: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: Database["public"]["Enums"]["session_frequency"]
          id?: string
          start_week?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_session_schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          session_partner: string
          session_start: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_partner: string
          session_start?: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          session_partner?: string
          session_start?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      user_tools: {
        Row: {
          assigned_at: string
          assigned_by: string
          created_at: string
          expires_at: string
          id: string
          status: string
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          created_at?: string
          expires_at: string
          id?: string
          status?: string
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          created_at?: string
          expires_at?: string
          id?: string
          status?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      values_acknowledgment: {
        Row: {
          acknowledged_at: string | null
          id: string
        }
        Insert: {
          acknowledged_at?: string | null
          id: string
        }
        Update: {
          acknowledged_at?: string | null
          id?: string
        }
        Relationships: []
      }
      video_sessions: {
        Row: {
          agora_channel_name: string | null
          agora_metadata: Json | null
          agora_token: string | null
          audio_url: string | null
          connection_quality: Json | null
          connection_state: string | null
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          expires_at: string | null
          ice_connection_state: string | null
          id: string
          local_stream_id: string | null
          match_id: string | null
          metadata: Json | null
          remote_stream_id: string | null
          session_participants: Json | null
          session_status: string | null
          session_title: string | null
          signaling_state: string | null
          started_at: string
          status: string
          transcript_id: string | null
          updated_at: string
          user1_id: string
          user2_id: string
          video_url: string | null
          webrtc_type: string | null
        }
        Insert: {
          agora_channel_name?: string | null
          agora_metadata?: Json | null
          agora_token?: string | null
          audio_url?: string | null
          connection_quality?: Json | null
          connection_state?: string | null
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          expires_at?: string | null
          ice_connection_state?: string | null
          id?: string
          local_stream_id?: string | null
          match_id?: string | null
          metadata?: Json | null
          remote_stream_id?: string | null
          session_participants?: Json | null
          session_status?: string | null
          session_title?: string | null
          signaling_state?: string | null
          started_at?: string
          status?: string
          transcript_id?: string | null
          updated_at?: string
          user1_id: string
          user2_id: string
          video_url?: string | null
          webrtc_type?: string | null
        }
        Update: {
          agora_channel_name?: string | null
          agora_metadata?: Json | null
          agora_token?: string | null
          audio_url?: string | null
          connection_quality?: Json | null
          connection_state?: string | null
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          expires_at?: string | null
          ice_connection_state?: string | null
          id?: string
          local_stream_id?: string | null
          match_id?: string | null
          metadata?: Json | null
          remote_stream_id?: string | null
          session_participants?: Json | null
          session_status?: string | null
          session_title?: string | null
          signaling_state?: string | null
          started_at?: string
          status?: string
          transcript_id?: string | null
          updated_at?: string
          user1_id?: string
          user2_id?: string
          video_url?: string | null
          webrtc_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_sessions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_sessions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "potential_session_correlations"
            referencedColumns: ["match_id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          conversation_id: string
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          metadata: Json | null
          processing_time: number | null
          session_type: string | null
          status: string
          timestamp: string | null
          updated_at: string | null
          user_ids: string[] | null
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          processing_time?: number | null
          session_type?: string | null
          status: string
          timestamp?: string | null
          updated_at?: string | null
          user_ids?: string[] | null
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          processing_time?: number | null
          session_type?: string | null
          status?: string
          timestamp?: string | null
          updated_at?: string | null
          user_ids?: string[] | null
        }
        Relationships: []
      }
      webrtc_sessions: {
        Row: {
          agora_channel_name: string
          agora_token: string | null
          allow_screen_share_all: boolean
          analytics_data: Json | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          goal_id: string
          id: string
          is_public: boolean
          max_participants: number | null
          participants_count: number
          require_approval: boolean
          session_status: string
          user_id: string
        }
        Insert: {
          agora_channel_name: string
          agora_token?: string | null
          allow_screen_share_all?: boolean
          analytics_data?: Json | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          goal_id: string
          id?: string
          is_public?: boolean
          max_participants?: number | null
          participants_count?: number
          require_approval?: boolean
          session_status?: string
          user_id: string
        }
        Update: {
          agora_channel_name?: string
          agora_token?: string | null
          allow_screen_share_all?: boolean
          analytics_data?: Json | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          goal_id?: string
          id?: string
          is_public?: boolean
          max_participants?: number | null
          participants_count?: number
          require_approval?: boolean
          session_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webrtc_sessions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "collaboration_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      webrtc_signals: {
        Row: {
          created_at: string
          id: string
          processed_at: string | null
          receiver_id: string | null
          sender_id: string
          session_id: string
          signal_data: Json
          signal_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          processed_at?: string | null
          receiver_id?: string | null
          sender_id: string
          session_id: string
          signal_data: Json
          signal_type: string
        }
        Update: {
          created_at?: string
          id?: string
          processed_at?: string | null
          receiver_id?: string | null
          sender_id?: string
          session_id?: string
          signal_data?: Json
          signal_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_notification_metrics: {
        Row: {
          delivered_count: number | null
          error_count: number | null
          failed_count: number | null
          hour: string | null
          priority: string | null
          total_count: number | null
          type: string | null
        }
        Relationships: []
      }
      admin_user_availability_view: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          pacing_level: string | null
          time_slots: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      potential_session_correlations: {
        Row: {
          match_created_at: string | null
          match_id: string | null
          metadata: Json | null
          session_ended_at: string | null
          session_started_at: string | null
          transcript_id: string | null
          transcript_time: string | null
          user1_name: string | null
          user2_name: string | null
        }
        Relationships: []
      }
      user_pacing_preferences_with_names: {
        Row: {
          community_id: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          pacing_level: string | null
          session_time: Database["public"]["Enums"]["session_time"] | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_pacing_preferences_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pacing_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_hat_detection: {
        Args: { p_detection_id: string }
        Returns: boolean
      }
      admin_add_beta_user: {
        Args: {
          user_id: string
          features_array: Database["public"]["Enums"]["beta_feature"][]
        }
        Returns: boolean
      }
      admin_remove_beta_user: {
        Args: { beta_user_id: string }
        Returns: boolean
      }
      admin_toggle_compass_area: {
        Args: { target_user_id: string; area_name: string; new_value: boolean }
        Returns: boolean
      }
      admin_toggle_compass_quartile: {
        Args: {
          target_user_id: string
          quartile_number: number
          new_value: boolean
        }
        Returns: boolean
      }
      auth_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      auto_progress_journey_stage: {
        Args: {
          p_user_id: string
          p_session_type: string
          p_has_match?: boolean
        }
        Returns: string
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      bulk_delete_test_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      can_complete_matches: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
      check_user_deletion_safety: {
        Args: { user_id_param: string }
        Returns: Json
      }
      clean_test_schema: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_chaos_test_session: {
        Args: { session_id: string; final_metrics?: Json; insights?: Json }
        Returns: undefined
      }
      completely_delete_match: {
        Args: { match_id_param: string }
        Returns: Json
      }
      count_user_matches: {
        Args: { user_id: string }
        Returns: number
      }
      create_hat_detection: {
        Args: {
          p_user_id: string
          p_hat_name: string
          p_source?: string
          p_confidence?: number
          p_session_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      create_notification_entry: {
        Args: {
          p_receiver_id: string
          p_sender_id: string
          p_message_content: string
          p_match_id: string
        }
        Returns: undefined
      }
      create_user_profile_with_logging: {
        Args: {
          p_user_id: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_transaction_id: string
        }
        Returns: boolean
      }
      debug_admin_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      delete_user_account: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      format_user_display_name: {
        Args: {
          first_name: string
          last_name: string
          email: string
          user_id: string
        }
        Returns: string
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_community_members: {
        Args: { community_id_param: string }
        Returns: {
          community_id: string
          first_name: string
          last_initial: string
          pacing_level: string
          role: string
          status: string
        }[]
      }
      get_compass_progress: {
        Args: { target_user_id: string }
        Returns: {
          quartile_1: boolean
          quartile_2: boolean
          quartile_3: boolean
          quartile_4: boolean
          progress_percentage: number
          completed_at: string
        }[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_email_template_with_account: {
        Args: { template_key_param: string }
        Returns: {
          template_id: string
          template_name: string
          subject: string
          header_html: string
          body_html: string
          footer_html: string
          variables: Json
          from_email: string
          from_name: string
        }[]
      }
      get_email_template_with_account_safe: {
        Args: { template_key_param: string }
        Returns: {
          template_id: string
          template_name: string
          subject: string
          header_html: string
          body_html: string
          footer_html: string
          variables: Json
          from_email: string
          from_name: string
        }[]
      }
      get_next_agora_uid: {
        Args: { session_uuid: string }
        Returns: number
      }
      get_user_data: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_last_signin: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_notification_preferences: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_transcripts_for_matching: {
        Args: { user_emails_param: string[] }
        Returns: {
          user_email: string
          user_id: string
          transcript_data: Json
          session_metadata: Json
          quality_score: number
          created_at: string
        }[]
      }
      get_weekly_session_counts: {
        Args: { start_date: string; end_date: string }
        Returns: {
          week_start: string
          selected_sessions: number
          kept_sessions: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      handle_user_posts_deletion: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      hard_delete_user_account: {
        Args: { user_id_param: string }
        Returns: Json
      }
      has_beta_feature: {
        Args: {
          user_uuid: string
          feature_name: Database["public"]["Enums"]["beta_feature"]
        }
        Returns: boolean
      }
      has_community_role: {
        Args: {
          user_id: string
          community_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_phone_verified: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_post_visible_to_user: {
        Args: { post_id: string; user_id: string }
        Returns: boolean
      }
      is_production_environment: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_sideby_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_sideby_admin_from_profile: {
        Args: { user_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      queue_upduo_integration: {
        Args: {
          p_user_id: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_crew_code?: string
          p_transaction_id?: string
        }
        Returns: string
      }
      reject_hat_detection: {
        Args: { p_detection_id: string }
        Returns: boolean
      }
      remove_user_from_sideby: {
        Args: { user_email: string }
        Returns: undefined
      }
      remove_user_from_sideby_improved: {
        Args: { user_email: string }
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      trigger_journey_monitor: {
        Args: { force_run?: boolean }
        Returns: Json
      }
      trigger_notification_digest: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      upsert_engagement_stats: {
        Args: {
          p_user_id: string
          p_community_id: string
          p_engagement_type: string
        }
        Returns: undefined
      }
      upsert_learning_progress: {
        Args: {
          p_user_id: string
          p_concept: string
          p_duration_minutes: number
        }
        Returns: undefined
      }
      use_schema: {
        Args: { schema_name: string }
        Returns: undefined
      }
      user_exists: {
        Args: { user_id: string }
        Returns: boolean
      }
      validate_admin_operation: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      admin_role: "guide" | "admin"
      app_role: "community_manager" | "member"
      beta_feature: "video_intro" | "transcription" | "newUserFlowBeta"
      email_account_type: "robot" | "team" | "info" | "notifications"
      feature_flag_type:
        | "new_dashboard"
        | "experimental_tools"
        | "advanced_analytics"
        | "beta_features"
      gap_status: "open" | "closed"
      match_analysis_type: "stance" | "learning" | "touchpoint" | "disagreement"
      pacing_level: "light" | "moderate" | "consistent" | "deep_dive"
      saved_item_type: "microtranslation" | "idea" | "resource"
      session_frequency: "weekly" | "biweekly" | "thrice_weekly"
      session_time: "9AM" | "12PM" | "3PM" | "6PM"
      template_status: "active" | "draft" | "archived"
      tool_type: "chatgpt_plus" | "lovable_dev" | "descript" | "upduo"
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
      admin_role: ["guide", "admin"],
      app_role: ["community_manager", "member"],
      beta_feature: ["video_intro", "transcription", "newUserFlowBeta"],
      email_account_type: ["robot", "team", "info", "notifications"],
      feature_flag_type: [
        "new_dashboard",
        "experimental_tools",
        "advanced_analytics",
        "beta_features",
      ],
      gap_status: ["open", "closed"],
      match_analysis_type: ["stance", "learning", "touchpoint", "disagreement"],
      pacing_level: ["light", "moderate", "consistent", "deep_dive"],
      saved_item_type: ["microtranslation", "idea", "resource"],
      session_frequency: ["weekly", "biweekly", "thrice_weekly"],
      session_time: ["9AM", "12PM", "3PM", "6PM"],
      template_status: ["active", "draft", "archived"],
      tool_type: ["chatgpt_plus", "lovable_dev", "descript", "upduo"],
    },
  },
} as const
