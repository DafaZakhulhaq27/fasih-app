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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
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
