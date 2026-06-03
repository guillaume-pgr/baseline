export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string | null
          birth_date: string | null
          sex: 'M' | 'F' | null
          height_cm: number | null
          current_mode: 'demo' | 'real'
          current_demo_id: string | null
          status: 'pending' | 'approved_free' | 'approved_premium' | 'rejected'
          is_admin: boolean
          cgv_accepted_at: string | null
          approved_at: string | null
          last_chat_question_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name?: string | null
          birth_date?: string | null
          sex?: 'M' | 'F' | null
          height_cm?: number | null
          current_mode?: 'demo' | 'real'
          current_demo_id?: string | null
          status?: 'pending' | 'approved_free' | 'approved_premium' | 'rejected'
          is_admin?: boolean
          cgv_accepted_at?: string | null
          approved_at?: string | null
          last_chat_question_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string | null
          birth_date?: string | null
          sex?: 'M' | 'F' | null
          height_cm?: number | null
          current_mode?: 'demo' | 'real'
          current_demo_id?: string | null
          status?: 'pending' | 'approved_free' | 'approved_premium' | 'rejected'
          is_admin?: boolean
          cgv_accepted_at?: string | null
          approved_at?: string | null
          last_chat_question_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blood_panels: {
        Row: {
          id: string
          profile_id: string
          panel_date: string
          lab_name: string | null
          source_pdf_url: string | null
          raw_extraction: Record<string, any> | null
          validated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          panel_date: string
          lab_name?: string | null
          source_pdf_url?: string | null
          raw_extraction?: Record<string, any> | null
          validated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          panel_date?: string
          lab_name?: string | null
          source_pdf_url?: string | null
          raw_extraction?: Record<string, any> | null
          validated_at?: string | null
          created_at?: string
        }
      }
      blood_markers: {
        Row: {
          id: string
          panel_id: string
          marker_code: string
          marker_name: string
          value: number
          unit: string
          ref_min: number | null
          ref_max: number | null
          organ_system: string | null
          status: 'optimal' | 'warning' | 'danger' | 'low_normal' | 'high_normal' | null
          created_at: string
        }
        Insert: {
          id?: string
          panel_id: string
          marker_code: string
          marker_name: string
          value: number
          unit: string
          ref_min?: number | null
          ref_max?: number | null
          organ_system?: string | null
          status?: 'optimal' | 'warning' | 'danger' | 'low_normal' | 'high_normal' | null
          created_at?: string
        }
        Update: {
          id?: string
          panel_id?: string
          marker_code?: string
          marker_name?: string
          value?: number
          unit?: string
          ref_min?: number | null
          ref_max?: number | null
          organ_system?: string | null
          status?: 'optimal' | 'warning' | 'danger' | 'low_normal' | 'high_normal' | null
          created_at?: string
        }
      }
      body_measurements: {
        Row: {
          id: string
          profile_id: string
          measured_at: string
          source: string
          weight_kg: number | null
          body_fat_pct: number | null
          muscle_mass_kg: number | null
          muscle_mass_pct: number | null
          bone_mass_kg: number | null
          water_pct: number | null
          visceral_fat: number | null
          bmr_kcal: number | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          measured_at: string
          source: string
          weight_kg?: number | null
          body_fat_pct?: number | null
          muscle_mass_kg?: number | null
          muscle_mass_pct?: number | null
          bone_mass_kg?: number | null
          water_pct?: number | null
          visceral_fat?: number | null
          bmr_kcal?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          measured_at?: string
          source?: string
          weight_kg?: number | null
          body_fat_pct?: number | null
          muscle_mass_kg?: number | null
          muscle_mass_pct?: number | null
          bone_mass_kg?: number | null
          water_pct?: number | null
          visceral_fat?: number | null
          bmr_kcal?: number | null
          created_at?: string
        }
      }
      vo2max_readings: {
        Row: {
          id: string
          profile_id: string
          measured_at: string
          source: string
          vo2max_value: number
          fitness_age: number | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          measured_at: string
          source: string
          vo2max_value: number
          fitness_age?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          measured_at?: string
          source?: string
          vo2max_value?: number
          fitness_age?: number | null
          created_at?: string
        }
      }
      sleep_readings: {
        Row: {
          id: string
          profile_id: string
          measured_at: string
          source: string
          total_minutes: number | null
          deep_minutes: number | null
          rem_minutes: number | null
          light_minutes: number | null
          awake_minutes: number | null
          hrv_rmssd: number | null
          resting_hr: number | null
          efficiency_pct: number | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          measured_at: string
          source: string
          total_minutes?: number | null
          deep_minutes?: number | null
          rem_minutes?: number | null
          light_minutes?: number | null
          awake_minutes?: number | null
          hrv_rmssd?: number | null
          resting_hr?: number | null
          efficiency_pct?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          measured_at?: string
          source?: string
          total_minutes?: number | null
          deep_minutes?: number | null
          rem_minutes?: number | null
          light_minutes?: number | null
          awake_minutes?: number | null
          hrv_rmssd?: number | null
          resting_hr?: number | null
          efficiency_pct?: number | null
          created_at?: string
        }
      }
      microbiome_tests: {
        Row: {
          id: string
          profile_id: string
          test_date: string
          source: string
          shannon_diversity: number | null
          firmicutes_pct: number | null
          bacteroidetes_pct: number | null
          fb_ratio: number | null
          raw_data: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          test_date: string
          source: string
          shannon_diversity?: number | null
          firmicutes_pct?: number | null
          bacteroidetes_pct?: number | null
          fb_ratio?: number | null
          raw_data?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          test_date?: string
          source?: string
          shannon_diversity?: number | null
          firmicutes_pct?: number | null
          bacteroidetes_pct?: number | null
          fb_ratio?: number | null
          raw_data?: Record<string, any> | null
          created_at?: string
        }
      }
      health_connections: {
        Row: {
          id: string
          profile_id: string
          provider: string
          access_token: string | null
          refresh_token: string | null
          expires_at: string | null
          provider_user_id: string | null
          scopes: string[] | null
          last_sync_at: string | null
          status: 'active' | 'expired' | 'revoked' | 'error'
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          provider: string
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          provider_user_id?: string | null
          scopes?: string[] | null
          last_sync_at?: string | null
          status?: 'active' | 'expired' | 'revoked' | 'error'
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          provider?: string
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          provider_user_id?: string | null
          scopes?: string[] | null
          last_sync_at?: string | null
          status?: 'active' | 'expired' | 'revoked' | 'error'
          created_at?: string
        }
      }
      chat_conversations: {
        Row: {
          id: string
          profile_id: string
          context_page: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          context_page?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          context_page?: string | null
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
