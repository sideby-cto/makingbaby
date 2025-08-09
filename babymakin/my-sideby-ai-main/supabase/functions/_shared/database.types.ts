
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      enhanced_transcript_analysis: {
        Row: {
          id: string
          transcript_id: string
          user_id: string
          emotional_sentiment: Json
          engagement_patterns: Json
          semantic_topics: Json
          expertise_indicators: Json
          learning_moments: Json
          personality_traits: Json
          analysis_version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transcript_id: string
          user_id: string
          emotional_sentiment: Json
          engagement_patterns: Json
          semantic_topics: Json
          expertise_indicators: Json
          learning_moments: Json
          personality_traits: Json
          analysis_version?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transcript_id?: string
          user_id?: string
          emotional_sentiment?: Json
          engagement_patterns?: Json
          semantic_topics?: Json
          expertise_indicators?: Json
          learning_moments?: Json
          personality_traits?: Json
          analysis_version?: string
          created_at?: string
          updated_at?: string
        }
      }
      journey_stage_config: {
        Row: {
          id: string
          stage: string
          reminder_times: Json
          welcome_email_enabled: boolean
          welcome_email_delay_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stage: string
          reminder_times?: Json
          welcome_email_enabled?: boolean
          welcome_email_delay_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stage?: string
          reminder_times?: Json
          welcome_email_enabled?: boolean
          welcome_email_delay_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
      journey_reminder_templates: {
        Row: {
          id: string
          stage: string
          reminder_type: string
          subject: string
          content: string
          cta_text?: string
          cta_url?: string
          active: boolean
          email_template_id?: string
          template_variables?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stage: string
          reminder_type: string
          subject: string
          content: string
          cta_text?: string
          cta_url?: string
          active?: boolean
          email_template_id?: string
          template_variables?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stage?: string
          reminder_type?: string
          subject?: string
          content?: string
          cta_text?: string
          cta_url?: string
          active?: boolean
          email_template_id?: string
          template_variables?: string
          created_at?: string
          updated_at?: string
        }
      }
      journey_reminder_logs: {
        Row: {
          id: string
          user_id: string
          stage: string
          reminder_type: string
          template_id?: string
          notification_id?: string
          success: boolean
          sent_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stage: string
          reminder_type: string
          template_id?: string
          notification_id?: string
          success?: boolean
          sent_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stage?: string
          reminder_type?: string
          template_id?: string
          notification_id?: string
          success?: boolean
          sent_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          content: string
          read: boolean
          channels?: Json
          data?: Json
          created_at: string
          updated_at: string
          status: string
          error?: string
          priority: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          content: string
          read?: boolean
          channels?: Json
          data?: Json
          created_at?: string
          updated_at?: string
          status?: string
          error?: string
          priority?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          content?: string
          read?: boolean
          channels?: Json
          data?: Json
          created_at?: string
          updated_at?: string
          status?: string
          error?: string
          priority?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name?: string
          last_name?: string
          status: string
          journey_stage?: string
          has_completed_reflection?: boolean
        }
        Insert: {
          id: string
          email: string
          first_name?: string
          last_name?: string
          status?: string
          journey_stage?: string
          has_completed_reflection?: boolean
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          status?: string
          journey_stage?: string
          has_completed_reflection?: boolean
        }
      }
      upduo_transcripts: {
        Row: {
          id: string
          user_id: string
          conversation_id: string
          transcript: Json
          metadata?: Json
          session_duration?: number
          quality_score?: number
          word_count?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          conversation_id: string
          transcript: Json
          metadata?: Json
          session_duration?: number
          quality_score?: number
          word_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          conversation_id?: string
          transcript?: Json
          metadata?: Json
          session_duration?: number
          quality_score?: number
          word_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_journey_events: {
        Row: {
          id: string
          user_id: string
          previous_stage?: string
          new_stage: string
          metadata?: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          previous_stage?: string
          new_stage: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          previous_stage?: string
          new_stage?: string
          metadata?: Json
          created_at?: string
        }
      }
    }
  }
}
