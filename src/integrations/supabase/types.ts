export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      hebrew_alphabet: {
        Row: {
          created_at: string
          id: string
          letter: string
          name: string
          sound_description: string | null
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          letter: string
          name: string
          sound_description?: string | null
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          letter?: string
          name?: string
          sound_description?: string | null
          transliteration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hebrew_phrases: {
        Row: {
          created_at: string
          english: string
          hebrew: string
          id: string
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          english: string
          hebrew: string
          id?: string
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          english?: string
          hebrew?: string
          id?: string
          transliteration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hebrew_sentences: {
        Row: {
          created_at: string
          english_translation: string
          hebrew_words: string[]
          hint: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          english_translation: string
          hebrew_words: string[]
          hint?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          english_translation?: string
          hebrew_words?: string[]
          hint?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      hebrew_verbs: {
        Row: {
          conjugation: string | null
          created_at: string
          english: string
          hebrew: string
          id: string
          root: string | null
          tense: string | null
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          conjugation?: string | null
          created_at?: string
          english: string
          hebrew: string
          id?: string
          root?: string | null
          tense?: string | null
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          conjugation?: string | null
          created_at?: string
          english?: string
          hebrew?: string
          id?: string
          root?: string | null
          tense?: string | null
          transliteration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hebrew_words: {
        Row: {
          created_at: string
          english: string
          hebrew: string
          id: string
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          english: string
          hebrew: string
          id?: string
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          english?: string
          hebrew?: string
          id?: string
          transliteration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pronunciation_leaderboard: {
        Row: {
          attempts: number
          average_score: number | null
          id: string
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          average_score?: number | null
          id?: string
          total_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          average_score?: number | null
          id?: string
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pronunciation_scores: {
        Row: {
          created_at: string
          id: string
          score: number
          user_id: string
          word: string
        }
        Insert: {
          created_at?: string
          id?: string
          score: number
          user_id: string
          word: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          user_id?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
