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
      expense_installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          expense_id: string
          id: string
          paid_amount: number
          paid_by: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          expense_id: string
          id?: string
          paid_amount?: number
          paid_by?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          expense_id?: string
          id?: string
          paid_amount?: number
          paid_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'expense_installments_expense_id_fkey'
            columns: ['expense_id']
            isOneToOne: false
            referencedRelation: 'expenses'
            referencedColumns: ['id']
          },
        ]
      }
      expenses: {
        Row: {
          created_at: string
          description: string
          id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      gifts: {
        Row: {
          category: Database['public']['Enums']['gift_category']
          created_at: string | null
          description: string | null
          goal_amount: number | null
          id: string
          image_path: string | null
          is_reserved: boolean
          kind: Database['public']['Enums']['gift_kind']
          min_amount: number | null
          name: string
          price: number | null
          reserved_at: string | null
          reserved_by_email: string | null
          reserved_by_name: string | null
          reserved_message: string | null
          suggested_amounts: number[]
        }
        Insert: {
          category?: Database['public']['Enums']['gift_category']
          created_at?: string | null
          description?: string | null
          goal_amount?: number | null
          id?: string
          image_path?: string | null
          is_reserved?: boolean
          kind?: Database['public']['Enums']['gift_kind']
          min_amount?: number | null
          name: string
          price?: number | null
          reserved_at?: string | null
          reserved_by_email?: string | null
          reserved_by_name?: string | null
          reserved_message?: string | null
          suggested_amounts?: number[]
        }
        Update: {
          category?: Database['public']['Enums']['gift_category']
          created_at?: string | null
          description?: string | null
          goal_amount?: number | null
          id?: string
          image_path?: string | null
          is_reserved?: boolean
          kind?: Database['public']['Enums']['gift_kind']
          min_amount?: number | null
          name?: string
          price?: number | null
          reserved_at?: string | null
          reserved_by_email?: string | null
          reserved_by_name?: string | null
          reserved_message?: string | null
          suggested_amounts?: number[]
        }
        Relationships: []
      }
      guests: {
        Row: {
          confirmed_at: string | null
          created_at: string
          first_name: string
          id: string
          invite_token: string
          last_name: string
          notes: string | null
          party_id: string
          party_invite_token: string
          status: Database['public']['Enums']['guest_status']
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          first_name: string
          id?: string
          invite_token?: string
          last_name: string
          notes?: string | null
          party_id?: string
          party_invite_token?: string
          status?: Database['public']['Enums']['guest_status']
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          first_name?: string
          id?: string
          invite_token?: string
          last_name?: string
          notes?: string | null
          party_id?: string
          party_invite_token?: string
          status?: Database['public']['Enums']['guest_status']
          updated_at?: string
        }
        Relationships: []
      }
      invite_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          last_visited_at: string | null
          revoked_at: string | null
          token: string
          updated_at: string
          visit_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          last_visited_at?: string | null
          revoked_at?: string | null
          token?: string
          updated_at?: string
          visit_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          last_visited_at?: string | null
          revoked_at?: string | null
          token?: string
          updated_at?: string
          visit_count?: number
        }
        Relationships: []
      }
      keep_alive: {
        Row: {
          id: number
          pinged_at: string
          source: string | null
        }
        Insert: {
          id?: number
          pinged_at?: string
          source?: string | null
        }
        Update: {
          id?: number
          pinged_at?: string
          source?: string | null
        }
        Relationships: []
      }
      pix_confirmations: {
        Row: {
          amount: number
          confirmed: boolean
          created_at: string | null
          gift_id: string | null
          guest_name: string
          id: string
          mp_payment_id: string | null
          payment_method: string
        }
        Insert: {
          amount: number
          confirmed?: boolean
          created_at?: string | null
          gift_id?: string | null
          guest_name: string
          id?: string
          mp_payment_id?: string | null
          payment_method?: string
        }
        Update: {
          amount?: number
          confirmed?: boolean
          created_at?: string | null
          gift_id?: string | null
          guest_name?: string
          id?: string
          mp_payment_id?: string | null
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pix_confirmations_gift_id_fkey'
            columns: ['gift_id']
            isOneToOne: false
            referencedRelation: 'gifts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pix_confirmations_gift_id_fkey'
            columns: ['gift_id']
            isOneToOne: false
            referencedRelation: 'gifts_with_totals'
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
          guest_id: string | null
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
          guest_id?: string | null
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
          guest_id?: string | null
          id?: string
          message?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'rsvp_guest_id_fkey'
            columns: ['guest_id']
            isOneToOne: false
            referencedRelation: 'guests'
            referencedColumns: ['id']
          },
        ]
      }
      rsvp_requests: {
        Row: {
          attending: boolean
          created_at: string
          decided_at: string | null
          email: string
          full_name: string
          guest_id: string | null
          id: string
          message: string | null
          notified_at: string | null
          notify_attempts: number
          notify_error: string | null
          status: Database['public']['Enums']['rsvp_request_status']
          updated_at: string
        }
        Insert: {
          attending: boolean
          created_at?: string
          decided_at?: string | null
          email: string
          full_name: string
          guest_id?: string | null
          id?: string
          message?: string | null
          notified_at?: string | null
          notify_attempts?: number
          notify_error?: string | null
          status?: Database['public']['Enums']['rsvp_request_status']
          updated_at?: string
        }
        Update: {
          attending?: boolean
          created_at?: string
          decided_at?: string | null
          email?: string
          full_name?: string
          guest_id?: string | null
          id?: string
          message?: string | null
          notified_at?: string | null
          notify_attempts?: number
          notify_error?: string | null
          status?: Database['public']['Enums']['rsvp_request_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rsvp_requests_guest_id_fkey'
            columns: ['guest_id']
            isOneToOne: false
            referencedRelation: 'guests'
            referencedColumns: ['id']
          },
        ]
      }
      site_images: {
        Row: {
          alt: string | null
          created_at: string
          display_order: number
          id: string
          image_path: string | null
          is_active: boolean
          key: string
          section: string
          updated_at: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string | null
          is_active?: boolean
          key: string
          section: string
          updated_at?: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string | null
          is_active?: boolean
          key?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          audio_path: string
          created_at: string
          display_order: number
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          audio_path: string
          created_at?: string
          display_order?: number
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          audio_path?: string
          created_at?: string
          display_order?: number
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      gifts_with_totals: {
        Row: {
          category: Database['public']['Enums']['gift_category'] | null
          confirmed_total: number | null
          contributor_count: number | null
          created_at: string | null
          description: string | null
          goal_amount: number | null
          id: string | null
          image_path: string | null
          is_reserved: boolean | null
          kind: Database['public']['Enums']['gift_kind'] | null
          min_amount: number | null
          name: string | null
          pledged_total: number | null
          price: number | null
          reserved_at: string | null
          reserved_by_email: string | null
          reserved_by_name: string | null
          reserved_message: string | null
          suggested_amounts: number[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_rsvp_request: {
        Args: { p_request_id: string }
        Returns: {
          attending: boolean
          created_at: string
          decided_at: string | null
          email: string
          full_name: string
          guest_id: string | null
          id: string
          message: string | null
          notified_at: string | null
          notify_attempts: number
          notify_error: string | null
          status: Database['public']['Enums']['rsvp_request_status']
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'rsvp_requests'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_rsvp_notification: {
        Args: { p_error?: string; p_ok: boolean; p_request_id: string }
        Returns: {
          attending: boolean
          created_at: string
          decided_at: string | null
          email: string
          full_name: string
          guest_id: string | null
          id: string
          message: string | null
          notified_at: string | null
          notify_attempts: number
          notify_error: string | null
          status: Database['public']['Enums']['rsvp_request_status']
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'rsvp_requests'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reserve_gift: {
        Args: {
          p_amount?: number
          p_contribution_id?: string
          p_gift_id: string
          p_message: string
          p_name: string
        }
        Returns: {
          category: Database['public']['Enums']['gift_category'] | null
          confirmed_total: number | null
          contributor_count: number | null
          created_at: string | null
          description: string | null
          goal_amount: number | null
          id: string | null
          image_path: string | null
          is_reserved: boolean | null
          kind: Database['public']['Enums']['gift_kind'] | null
          min_amount: number | null
          name: string | null
          pledged_total: number | null
          price: number | null
          reserved_at: string | null
          reserved_by_email: string | null
          reserved_by_name: string | null
          reserved_message: string | null
          suggested_amounts: number[] | null
        }[]
        SetofOptions: {
          from: '*'
          to: 'gifts_with_totals'
          isOneToOne: false
          isSetofReturn: true
        }
      }
      reserve_gift_paid: {
        Args: {
          p_amount: number
          p_contribution_id: string
          p_gift_id: string
          p_message: string
          p_mp_payment_id: string
          p_name: string
          p_payment_method: string
        }
        Returns: {
          category: Database['public']['Enums']['gift_category'] | null
          confirmed_total: number | null
          contributor_count: number | null
          created_at: string | null
          description: string | null
          goal_amount: number | null
          id: string | null
          image_path: string | null
          is_reserved: boolean | null
          kind: Database['public']['Enums']['gift_kind'] | null
          min_amount: number | null
          name: string | null
          pledged_total: number | null
          price: number | null
          reserved_at: string | null
          reserved_by_email: string | null
          reserved_by_name: string | null
          reserved_message: string | null
          suggested_amounts: number[] | null
        }[]
        SetofOptions: {
          from: '*'
          to: 'gifts_with_totals'
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_guest_statuses: {
        Args: { p_updates: Json }
        Returns: {
          confirmed_at: string | null
          created_at: string
          first_name: string
          id: string
          invite_token: string
          last_name: string
          notes: string | null
          party_id: string
          party_invite_token: string
          status: Database['public']['Enums']['guest_status']
          updated_at: string
        }[]
        SetofOptions: {
          from: '*'
          to: 'guests'
          isOneToOne: false
          isSetofReturn: true
        }
      }
      touch_invite_link: { Args: { p_token: string }; Returns: undefined }
    }
    Enums: {
      gift_category: 'home' | 'kitchen' | 'travel' | 'experience' | 'other'
      gift_kind: 'fixed_item' | 'open_item' | 'fund'
      guest_status: 'going' | 'pending' | 'not_going'
      rsvp_request_status: 'pending' | 'approved' | 'rejected'
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
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
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
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
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
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
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
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
      gift_kind: ['fixed_item', 'open_item', 'fund'],
      guest_status: ['going', 'pending', 'not_going'],
      rsvp_request_status: ['pending', 'approved', 'rejected'],
    },
  },
} as const
