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
        }
        Update: {
          full_name?: string
          username?: string
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          customer_name: string
          customer_phone: string | null
          customer_address: string | null
          total_price: number
          amount_paid: number
          status: string
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
          total_price: number
          amount_paid?: number
          status?: string
          notes?: string | null
        }
        Update: {
          customer_name?: string
          customer_phone?: string | null
          customer_address?: string | null
          total_price?: number
          amount_paid?: number
          status?: string
          notes?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          user_id: string
          service_name: string
          weight: number
          price_per_kg: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          service_name: string
          weight: number
          price_per_kg: number
          subtotal: number
        }
        Update: {
          service_name?: string
          weight?: number
          price_per_kg?: number
          subtotal?: number
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          user_id: string
          amount: number
          payment_method: string
          payment_status: string
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
          payment_method: string
          payment_status?: string
          payment_date?: string | null
          notes?: string | null
        }
        Update: {
          amount?: number
          payment_method?: string
          payment_status?: string
          payment_date?: string | null
          notes?: string | null
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
        }
        Update: {
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']