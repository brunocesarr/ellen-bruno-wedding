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
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      gifts: {
        Row: {
          category: Database['public']['Enums']['gift_category']
          created_at: string | null
          description: string | null
          id: string
          image_path: string | null
          is_reserved: boolean | null
          name: string
          price: number
          reserved_at: string | null
          reserved_by_email: string | null
          reserved_by_name: string | null
          reserved_message: string | null
        }
        Insert: {
          category?: Database['public']['Enums']['gift_category']
          created_at?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          is_reserved?: boolean | null
          name: string
          price: number
          reserved_at?: string | null
          reserved_by_email?: string | null
          reserved_by_name?: string | null
          reserved_message?: string | null
        }
        Update: {
          category?: Database['public']['Enums']['gift_category']
          created_at?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          is_reserved?: boolean | null
          name?: string
          price?: number
          reserved_at?: string | null
          reserved_by_email?: string | null
          reserved_by_name?: string | null
          reserved_message?: string | null
        }
        Relationships: []
      }
      pix_confirmations: {
        Row: {
          amount: number
          confirmed: boolean | null
          created_at: string | null
          gift_id: string | null
          guest_name: string
          id: string
        }
        Insert: {
          amount: number
          confirmed?: boolean | null
          created_at?: string | null
          gift_id?: string | null
          guest_name: string
          id?: string
        }
        Update: {
          amount?: number
          confirmed?: boolean | null
          created_at?: string | null
          gift_id?: string | null
          guest_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pix_confirmations_gift_id_fkey'
            columns: ['gift_id']
            isOneToOne: false
            referencedRelation: 'gifts'
            referencedColumns: ['id']
          },
        ]
      }
      rsvp: {
        Row: {
          attending: boolean
          companions: number
          created_at: string | null
          dietary_restrictions: string | null
          email: string | null
          full_name: string
          id: string
          message: string | null
          phone: string | null
        }
        Insert: {
          attending: boolean
          companions?: number
          created_at?: string | null
          dietary_restrictions?: string | null
          email?: string | null
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
        }
        Update: {
          attending?: boolean
          companions?: number
          created_at?: string | null
          dietary_restrictions?: string | null
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reserve_gift: {
        Args: { p_gift_id: string; p_message?: string; p_name: string }
        Returns: {
          category: Database['public']['Enums']['gift_category']
          created_at: string | null
          description: string | null
          id: string
          image_path: string | null
          is_reserved: boolean | null
          name: string
          price: number
          reserved_at: string | null
          reserved_by_email: string | null
          reserved_by_name: string | null
          reserved_message: string | null
        }
        SetofOptions: {
          from: '*'
          to: 'gifts'
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      gift_category: 'home' | 'kitchen' | 'travel' | 'experience' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      gift_category: ['home', 'kitchen', 'travel', 'experience', 'other'],
    },
  },
} as const
