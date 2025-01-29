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
      dictionary_word_feedback: {
        Row: {
          created_at: string
          english: string
          hebrew: string
          id: string
          negative_votes: number | null
          positive_votes: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          english: string
          hebrew: string
          id?: string
          negative_votes?: number | null
          positive_votes?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          english?: string
          hebrew?: string
          id?: string
          negative_votes?: number | null
          positive_votes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      hebrew_alphabet: {
        Row: {
          created_at: string
          english: string
          hebrew: string
          id: string
          letter: string
          name: string
          sound_description: string | null
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          english: string
          hebrew: string
          id?: string
          letter: string
          name: string
          sound_description?: string | null
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          english?: string
          hebrew?: string
          id?: string
          letter?: string
          name?: string
          sound_description?: string | null
          transliteration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hebrew_bulk_words: {
        Row: {
          created_at: string
          english: string
          hebrew: string
          id: number
          transliteration: string | null
          updated_at: string
          word_number: number
        }
        Insert: {
          created_at?: string
          english: string
          hebrew: string
          id?: number
          transliteration?: string | null
          updated_at?: string
          word_number: number
        }
        Update: {
          created_at?: string
          english?: string
          hebrew?: string
          id?: number
          transliteration?: string | null
          updated_at?: string
          word_number?: number
        }
        Relationships: []
      }
      hebrew_fill_blanks: {
        Row: {
          created_at: string
          hint: string | null
          id: string
          missing_word: string
          sentence: string
          translation: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hint?: string | null
          id?: string
          missing_word: string
          sentence: string
          translation: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hint?: string | null
          id?: string
          missing_word?: string
          sentence?: string
          translation?: string
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
      hebrew_scavenger_hunt: {
        Row: {
          category: string
          created_at: string
          english: string
          hebrew: string
          hint: string | null
          id: string
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          english: string
          hebrew: string
          hint?: string | null
          id?: string
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          english?: string
          hebrew?: string
          hint?: string | null
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
      hebrew_word_dump: {
        Row: {
          created_at: string
          english: string
          hebrew: string
          id: number
          processed: boolean | null
          transliteration: string | null
          updated_at: string
          word_number: number | null
        }
        Insert: {
          created_at?: string
          english: string
          hebrew: string
          id?: number
          processed?: boolean | null
          transliteration?: string | null
          updated_at?: string
          word_number?: number | null
        }
        Update: {
          created_at?: string
          english?: string
          hebrew?: string
          id?: number
          processed?: boolean | null
          transliteration?: string | null
          updated_at?: string
          word_number?: number | null
        }
        Relationships: []
      }
      hebrew_words: {
        Row: {
          created_at: string
          english: string
          hebrew: string
          id: string
          is_object: boolean | null
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          english: string
          hebrew: string
          id?: string
          is_object?: boolean | null
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          english?: string
          hebrew?: string
          id?: string
          is_object?: boolean | null
          transliteration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      memory_game_leaderboard: {
        Row: {
          attempts: number | null
          best_time: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_time?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_time?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_game_scores: {
        Row: {
          created_at: string
          id: string
          pairs_matched: number
          time_taken: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pairs_matched: number
          time_taken: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pairs_matched?: number
          time_taken?: number
          user_id?: string
        }
        Relationships: []
      }
      multiple_choice_leaderboard: {
        Row: {
          attempts: number | null
          best_time: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_time?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_time?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      multiple_choice_scores: {
        Row: {
          created_at: string
          id: string
          score: number
          time_taken: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score: number
          time_taken: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          time_taken?: number
          user_id?: string
        }
        Relationships: []
      }
      pronunciation_leaderboard: {
        Row: {
          attempts: number
          average_score: number | null
          best_time: number | null
          id: string
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          average_score?: number | null
          best_time?: number | null
          id?: string
          total_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          average_score?: number | null
          best_time?: number | null
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
          time_taken: number | null
          user_id: string
          word: string
        }
        Insert: {
          created_at?: string
          id?: string
          score: number
          time_taken?: number | null
          user_id: string
          word: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          time_taken?: number | null
          user_id?: string
          word?: string
        }
        Relationships: []
      }
      scavenger_hunt_images: {
        Row: {
          created_at: string
          id: string
          image_path: string
          updated_at: string
          word_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_path: string
          updated_at?: string
          word_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string
          updated_at?: string
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scavenger_hunt_images_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "hebrew_words"
            referencedColumns: ["id"]
          },
        ]
      }
      sentence_builder_leaderboard: {
        Row: {
          attempts: number | null
          best_time: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_time?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_time?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sentence_builder_scores: {
        Row: {
          created_at: string
          id: string
          score: number
          time_taken: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score: number
          time_taken: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          time_taken?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_word_feedback: {
        Args: {
          p_hebrew: string
          p_english: string
          p_is_positive: boolean
        }
        Returns: undefined
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
