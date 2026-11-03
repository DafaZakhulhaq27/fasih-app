export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      allowed_emails: {
        Row: {
          email: string;
          invited_at: string;
          invited_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          email: string;
          invited_at?: string;
          invited_by?: string | null;
        };
        Update: {
          email?: string;
          invited_at?: string;
          invited_by?: string | null;
        };
        Relationships: [];
      };
      attempts: {
        Row: {
          audio_path: string | null;
          check_mode: string;
          created_at: string;
          duration_ms: number | null;
          filler_count: number | null;
          id: string;
          long_pause_count: number | null;
          raw_text: string | null;
          self_review: Json | null;
          session_id: string;
          status: string;
          time_spent_s: number | null;
          transcript: string | null;
          updated_at: string;
          user_id: string;
          word_count: number | null;
          wpm: number | null;
        };
        ComputedFields: never;
        Insert: {
          audio_path?: string | null;
          check_mode?: string;
          created_at?: string;
          duration_ms?: number | null;
          filler_count?: number | null;
          id?: string;
          long_pause_count?: number | null;
          raw_text?: string | null;
          self_review?: Json | null;
          session_id: string;
          status?: string;
          time_spent_s?: number | null;
          transcript?: string | null;
          updated_at?: string;
          user_id?: string;
          word_count?: number | null;
          wpm?: number | null;
        };
        Update: {
          audio_path?: string | null;
          check_mode?: string;
          created_at?: string;
          duration_ms?: number | null;
          filler_count?: number | null;
          id?: string;
          long_pause_count?: number | null;
          raw_text?: string | null;
          self_review?: Json | null;
          session_id?: string;
          status?: string;
          time_spent_s?: number | null;
          transcript?: string | null;
          updated_at?: string;
          user_id?: string;
          word_count?: number | null;
          wpm?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'attempts_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'practice_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      band_scores: {
        Row: {
          attempt_id: string | null;
          band: number;
          criterion: string | null;
          id: string;
          is_estimate: boolean;
          raw_score: number | null;
          recorded_at: string;
          skill: string;
          source: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          attempt_id?: string | null;
          band: number;
          criterion?: string | null;
          id?: string;
          is_estimate?: boolean;
          raw_score?: number | null;
          recorded_at?: string;
          skill: string;
          source: string;
          user_id?: string;
        };
        Update: {
          attempt_id?: string | null;
          band?: number;
          criterion?: string | null;
          id?: string;
          is_estimate?: boolean;
          raw_score?: number | null;
          recorded_at?: string;
          skill?: string;
          source?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'band_scores_attempt_id_fkey';
            columns: ['attempt_id'];
            isOneToOne: false;
            referencedRelation: 'attempts';
            referencedColumns: ['id'];
          },
        ];
      };
      curriculum_units: {
        Row: {
          created_at: string;
          exam: string;
          focus: NonNullable<Json>;
          id: string;
          module: string | null;
          target_language: string;
          topic: string;
          updated_at: string;
          week: number;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          exam?: string;
          focus?: NonNullable<Json>;
          id?: string;
          module?: string | null;
          target_language?: string;
          topic: string;
          updated_at?: string;
          week: number;
        };
        Update: {
          created_at?: string;
          exam?: string;
          focus?: NonNullable<Json>;
          id?: string;
          module?: string | null;
          target_language?: string;
          topic?: string;
          updated_at?: string;
          week?: number;
        };
        Relationships: [];
      };
      exam_plans: {
        Row: {
          created_at: string;
          exam: string;
          final_mock_date: string | null;
          id: string;
          min_section_band: number | null;
          module: string | null;
          start_date: string | null;
          target_band: number | null;
          target_language: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          exam?: string;
          final_mock_date?: string | null;
          id?: string;
          min_section_band?: number | null;
          module?: string | null;
          start_date?: string | null;
          target_band?: number | null;
          target_language?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          exam?: string;
          final_mock_date?: string | null;
          id?: string;
          min_section_band?: number | null;
          module?: string | null;
          start_date?: string | null;
          target_band?: number | null;
          target_language?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          attempt_id: string;
          created_at: string;
          id: string;
          improved: string | null;
          model: string;
          payload: NonNullable<Json>;
          prompt_version: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          attempt_id: string;
          created_at?: string;
          id?: string;
          improved?: string | null;
          model: string;
          payload: NonNullable<Json>;
          prompt_version: string;
          user_id: string;
        };
        Update: {
          attempt_id?: string;
          created_at?: string;
          id?: string;
          improved?: string | null;
          model?: string;
          payload?: NonNullable<Json>;
          prompt_version?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_attempt_id_fkey';
            columns: ['attempt_id'];
            isOneToOne: true;
            referencedRelation: 'attempts';
            referencedColumns: ['id'];
          },
        ];
      };
      lesson_progress: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          lesson_id: string;
          score: number | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          lesson_id: string;
          score?: number | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          lesson_id?: string;
          score?: number | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lesson_progress_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      lessons: {
        Row: {
          content: NonNullable<Json>;
          content_version: number;
          created_at: string;
          id: string;
          kind: string;
          position: number;
          skill: string;
          unit_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          content: NonNullable<Json>;
          content_version?: number;
          created_at?: string;
          id?: string;
          kind?: string;
          position: number;
          skill: string;
          unit_id: string;
          updated_at?: string;
        };
        Update: {
          content?: NonNullable<Json>;
          content_version?: number;
          created_at?: string;
          id?: string;
          kind?: string;
          position?: number;
          skill?: string;
          unit_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lessons_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'curriculum_units';
            referencedColumns: ['id'];
          },
        ];
      };
      mistake_categories: {
        Row: {
          criterion: string;
          id: string;
          label: string;
          slug: string;
          sort_order: number;
          target_language: string;
        };
        ComputedFields: never;
        Insert: {
          criterion: string;
          id?: string;
          label: string;
          slug: string;
          sort_order?: number;
          target_language?: string;
        };
        Update: {
          criterion?: string;
          id?: string;
          label?: string;
          slug?: string;
          sort_order?: number;
          target_language?: string;
        };
        Relationships: [];
      };
      mistakes: {
        Row: {
          attempt_id: string | null;
          category_id: string;
          corrected_span: string;
          created_at: string;
          id: string;
          original_span: string;
          severity: string;
          source: string;
          status: string;
          subcategory: string | null;
          target_language: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          attempt_id?: string | null;
          category_id: string;
          corrected_span: string;
          created_at?: string;
          id?: string;
          original_span: string;
          severity?: string;
          source: string;
          status?: string;
          subcategory?: string | null;
          target_language?: string;
          user_id?: string;
        };
        Update: {
          attempt_id?: string | null;
          category_id?: string;
          corrected_span?: string;
          created_at?: string;
          id?: string;
          original_span?: string;
          severity?: string;
          source?: string;
          status?: string;
          subcategory?: string | null;
          target_language?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mistakes_attempt_id_fkey';
            columns: ['attempt_id'];
            isOneToOne: false;
            referencedRelation: 'attempts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mistakes_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'mistake_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      practice_sessions: {
        Row: {
          created_at: string;
          id: string;
          lesson_id: string | null;
          mode: string;
          prompt_id: string | null;
          target_language: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          lesson_id?: string | null;
          mode: string;
          prompt_id?: string | null;
          target_language?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          lesson_id?: string | null;
          mode?: string;
          prompt_id?: string | null;
          target_language?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'practice_sessions_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'practice_sessions_prompt_id_fkey';
            columns: ['prompt_id'];
            isOneToOne: false;
            referencedRelation: 'prompts';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          active_language: string;
          ai_enabled: boolean;
          created_at: string;
          daily_budget_usd: number | null;
          default_check: string;
          display_name: string | null;
          explain_lang: string;
          id: string;
          learning_languages: string[];
          role: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          active_language?: string;
          ai_enabled?: boolean;
          created_at?: string;
          daily_budget_usd?: number | null;
          default_check?: string;
          display_name?: string | null;
          explain_lang?: string;
          id: string;
          learning_languages?: string[];
          role?: string;
          updated_at?: string;
        };
        Update: {
          active_language?: string;
          ai_enabled?: boolean;
          created_at?: string;
          daily_budget_usd?: number | null;
          default_check?: string;
          display_name?: string | null;
          explain_lang?: string;
          id?: string;
          learning_languages?: string[];
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          content: NonNullable<Json>;
          created_at: string;
          essay_type: string | null;
          id: string;
          min_words: number | null;
          target_language: string;
          task: string;
          time_limit_s: number | null;
          topic: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          content: NonNullable<Json>;
          created_at?: string;
          essay_type?: string | null;
          id?: string;
          min_words?: number | null;
          target_language?: string;
          task: string;
          time_limit_s?: number | null;
          topic: string;
          updated_at?: string;
        };
        Update: {
          content?: NonNullable<Json>;
          created_at?: string;
          essay_type?: string | null;
          id?: string;
          min_words?: number | null;
          target_language?: string;
          task?: string;
          time_limit_s?: number | null;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      review_cards: {
        Row: {
          back: string;
          card_type: string;
          context: NonNullable<Json>;
          created_at: string;
          due: string;
          front: string;
          fsrs: NonNullable<Json>;
          id: string;
          lesson_id: string | null;
          mistake_id: string | null;
          target_language: string;
          updated_at: string;
          user_id: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          back: string;
          card_type: string;
          context?: NonNullable<Json>;
          created_at?: string;
          due: string;
          front: string;
          fsrs: NonNullable<Json>;
          id?: string;
          lesson_id?: string | null;
          mistake_id?: string | null;
          target_language?: string;
          updated_at?: string;
          user_id?: string;
          version?: number;
        };
        Update: {
          back?: string;
          card_type?: string;
          context?: NonNullable<Json>;
          created_at?: string;
          due?: string;
          front?: string;
          fsrs?: NonNullable<Json>;
          id?: string;
          lesson_id?: string | null;
          mistake_id?: string | null;
          target_language?: string;
          updated_at?: string;
          user_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'review_cards_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'review_cards_mistake_id_fkey';
            columns: ['mistake_id'];
            isOneToOne: false;
            referencedRelation: 'mistakes';
            referencedColumns: ['id'];
          },
        ];
      };
      review_logs: {
        Row: {
          card_id: string;
          created_at: string;
          fsrs_log: NonNullable<Json>;
          id: string;
          rating: number;
          reviewed_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          card_id: string;
          created_at?: string;
          fsrs_log: NonNullable<Json>;
          id: string;
          rating: number;
          reviewed_at: string;
          user_id: string;
        };
        Update: {
          card_id?: string;
          created_at?: string;
          fsrs_log?: NonNullable<Json>;
          id?: string;
          rating?: number;
          reviewed_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'review_logs_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'review_cards';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      record_review: {
        Args: {
          p_card_id: string;
          p_due: string;
          p_expected_version: number;
          p_fsrs: Json;
          p_fsrs_log: Json;
          p_log_id: string;
          p_rating: number;
          p_reviewed_at: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
