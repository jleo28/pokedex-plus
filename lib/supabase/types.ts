export type Database = {
  public: {
    Tables: {
      pokemon: {
        Row: {
          id: number;
          slug: string;
          name: string;
          generation: number;
          type_primary: string;
          type_secondary: string | null;
          hp: number;
          attack: number;
          defense: number;
          sp_attack: number;
          sp_defense: number;
          speed: number;
          base_stat_total: number;
          height_dm: number | null;
          weight_hg: number | null;
          is_legendary: boolean;
          sprite_url: string;
          cry_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id: number;
          slug: string;
          name: string;
          generation: number;
          type_primary: string;
          type_secondary?: string | null;
          hp: number;
          attack: number;
          defense: number;
          sp_attack: number;
          sp_defense: number;
          speed: number;
          height_dm?: number | null;
          weight_hg?: number | null;
          is_legendary?: boolean;
          sprite_url: string;
          cry_url?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['pokemon']['Insert']>;
      };
      evolutions: {
        Row: {
          id: number;
          from_id: number;
          to_id: number;
          trigger: string;
          trigger_value: string | null;
        };
        Insert: {
          id?: number;
          from_id: number;
          to_id: number;
          trigger: string;
          trigger_value?: string | null;
        };
        Update: Partial<Database['public']['Tables']['evolutions']['Insert']>;
      };
      user_submissions: {
        Row: {
          id: string;
          name: string;
          type_primary: string;
          type_secondary: string | null;
          hp: number;
          attack: number;
          defense: number;
          sp_attack: number;
          sp_defense: number;
          speed: number;
          predicted_bst: number | null;
          predicted_legendary: boolean | null;
          predicted_legendary_prob: number | null;
          created_at: string | null;
          ip_hash: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type_primary: string;
          type_secondary?: string | null;
          hp: number;
          attack: number;
          defense: number;
          sp_attack: number;
          sp_defense: number;
          speed: number;
          predicted_bst?: number | null;
          predicted_legendary?: boolean | null;
          predicted_legendary_prob?: number | null;
          created_at?: string | null;
          ip_hash?: string | null;
        };
        Update: Partial<Database['public']['Tables']['user_submissions']['Insert']>;
      };
      predictions_log: {
        Row: {
          id: string;
          input_stats: Record<string, number>;
          predicted_bst: number | null;
          predicted_legendary_prob: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          input_stats: Record<string, number>;
          predicted_bst?: number | null;
          predicted_legendary_prob?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['predictions_log']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
