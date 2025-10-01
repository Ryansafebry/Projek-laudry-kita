import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          username: string
          email: string
          phone: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          username: string
          email: string
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          username?: string
          email?: string
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          customer_name: string
          customer_phone: string | null
          customer_address: string | null
          service_type: string
          weight: number
          price_per_kg: number
          total_price: number
          status: 'pending' | 'processing' | 'completed' | 'picked_up'
          entry_date: string
          estimated_completion: string | null
          completion_date: string | null
          pickup_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_name: string
          customer_phone?: string | null
          customer_address?: string | null
          service_type: string
          weight: number
          price_per_kg: number
          total_price: number
          status?: 'pending' | 'processing' | 'completed' | 'picked_up'
          entry_date: string
          estimated_completion?: string | null
          completion_date?: string | null
          pickup_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_name?: string
          customer_phone?: string | null
          customer_address?: string | null
          service_type?: string
          weight?: number
          price_per_kg?: number
          total_price?: number
          status?: 'pending' | 'processing' | 'completed' | 'picked_up'
          entry_date?: string
          estimated_completion?: string | null
          completion_date?: string | null
          pickup_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          user_id: string
          amount: number
          payment_method: 'cash' | 'transfer' | 'card'
          payment_status: 'pending' | 'paid' | 'partial'
          payment_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          amount: number
          payment_method: 'cash' | 'transfer' | 'card'
          payment_status?: 'pending' | 'paid' | 'partial'
          payment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          amount?: number
          payment_method?: 'cash' | 'transfer' | 'card'
          payment_status?: 'pending' | 'paid' | 'partial'
          payment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          total_orders: number
          total_spent: number
          last_order_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          total_orders?: number
          total_spent?: number
          last_order_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          total_orders?: number
          total_spent?: number
          last_order_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
