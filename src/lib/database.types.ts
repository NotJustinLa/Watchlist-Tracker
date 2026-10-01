export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
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
  public: {
    Tables: {
      follows: {
        Row: {
          created_at: string;
          followee_id: string;
          follower_id: string;
          status: Database['public']['Enums']['follow_status'];
        };
        Insert: {
          created_at?: string;
          followee_id: string;
          follower_id: string;
          status: Database['public']['Enums']['follow_status'];
        };
        Update: {
          created_at?: string;
          followee_id?: string;
          follower_id?: string;
          status?: Database['public']['Enums']['follow_status'];
        };
        Relationships: [];
      };
      movies: {
        Row: {
          genres: string[];
          poster_path: string | null;
          release_year: number | null;
          title: string;
          tmdb_id: number;
        };
        Insert: {
          genres?: string[];
          poster_path?: string | null;
          release_year?: number | null;
          title: string;
          tmdb_id: number;
        };
        Update: {
          genres?: string[];
          poster_path?: string | null;
          release_year?: number | null;
          title?: string;
          tmdb_id?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          handle: string;
          id: string;
          is_private: boolean;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          handle: string;
          id: string;
          is_private?: boolean;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          handle?: string;
          id?: string;
          is_private?: boolean;
        };
        Relationships: [];
      };
      taste_profiles: {
        Row: {
          generated_at: string;
          rating_count: number;
          recommendations: Json;
          summary: string;
          user_id: string;
        };
        Insert: {
          generated_at?: string;
          rating_count?: number;
          recommendations: Json;
          summary: string;
          user_id: string;
        };
        Update: {
          generated_at?: string;
          rating_count?: number;
          recommendations?: Json;
          summary?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'taste_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      watched: {
        Row: {
          rating: number | null;
          tmdb_id: number;
          user_id: string;
          watched_at: string;
        };
        Insert: {
          rating?: number | null;
          tmdb_id: number;
          user_id: string;
          watched_at?: string;
        };
        Update: {
          rating?: number | null;
          tmdb_id?: number;
          user_id?: string;
          watched_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'watched_tmdb_id_fkey';
            columns: ['tmdb_id'];
            isOneToOne: false;
            referencedRelation: 'movies';
            referencedColumns: ['tmdb_id'];
          },
          {
            foreignKeyName: 'watched_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      watchlist_items: {
        Row: {
          added_at: string;
          tmdb_id: number;
          user_id: string;
        };
        Insert: {
          added_at?: string;
          tmdb_id: number;
          user_id: string;
        };
        Update: {
          added_at?: string;
          tmdb_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'watchlist_items_tmdb_id_fkey';
            columns: ['tmdb_id'];
            isOneToOne: false;
            referencedRelation: 'movies';
            referencedColumns: ['tmdb_id'];
          },
          {
            foreignKeyName: 'watchlist_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_view: { Args: { target: string }; Returns: boolean };
      create_profile: {
        Args: { meta: Json; user_id: string };
        Returns: undefined;
      };
      follow_by_handle: {
        Args: { target_handle: string };
        Returns: Database['public']['Enums']['follow_status'];
      };
      get_follow_requests: {
        Args: never;
        Returns: {
          avatar_url: string;
          display_name: string;
          handle: string;
          requested_at: string;
        }[];
      };
      handle_available: { Args: { candidate: string }; Returns: boolean };
      respond_to_request: {
        Args: { approve: boolean; follower_handle: string };
        Returns: undefined;
      };
      unfollow_by_handle: {
        Args: { target_handle: string };
        Returns: undefined;
      };
    };
    Enums: {
      follow_status: 'pending' | 'accepted';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {
      follow_status: ['pending', 'accepted'],
    },
  },
  public: {
    Enums: {},
  },
} as const;
