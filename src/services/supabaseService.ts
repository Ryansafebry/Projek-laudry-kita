import { supabase, Tables, TablesInsert, TablesUpdate } from '@/lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

type OrderWithItems = Tables<'orders'> & { order_items: Tables<'order_items'>[] }
type PaymentWithOrder = Tables<'payments'> & { orders: Pick<Tables<'orders'>, 'customer_name' | 'total_price'> | null }

export class SupabaseService {
  // ... (Auth and Profile methods remain the same)
  async signUp(email: string, password: string, userData: { fullName: string; username: string; phone?: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            username: userData.username,
            phone: userData.phone || ''
          }
        }
      })

      if (error) throw error
      return { success: true, user: data.user }
    } catch (error: any) {
      console.error('Supabase signUp error:', error)
      return { success: false, error: error.message }
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { success: true, user: data.user }
    } catch (error: any) {
      console.error('Supabase signIn error:', error)
      return { success: false, error: error.message }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Supabase signOut error:', error)
      return { success: false, error: error.message }
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  async getProfile(userId: string): Promise<Tables<'profiles'> | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }
      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }

  async createProfileFromUser(user: SupabaseUser): Promise<Tables<'profiles'> | null> {
    try {
      console.log("Creating profile for user:", user.id);
      const profileData: TablesInsert<'profiles'> = {
        id: user.id,
        user_id: user.id,
        full_name: user.user_metadata.full_name || 'New User',
        username: user.user_metadata.username || user.email?.split('@')[0] || `user${user.id.substring(0, 5)}`,
        email: user.email!,
        phone: user.user_metadata.phone || null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create profile from user error:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: TablesUpdate<'profiles'>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  // Orders methods (Updated)
  async getOrders(userId: string): Promise<OrderWithItems[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as OrderWithItems[]) || []
    } catch (error) {
      console.error('Get orders error:', error)
      return []
    }
  }

  async createOrderWithItems(
    orderData: TablesInsert<'orders'>,
    itemsData: Omit<TablesInsert<'order_items'>, 'order_id' | 'user_id'>[]
  ) {
    try {
      // 1. Create the main order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) throw orderError
      if (!newOrder) throw new Error("Order creation failed")

      // 2. Prepare and insert order items
      const itemsToInsert = itemsData.map(item => ({
        ...item,
        order_id: newOrder.id,
        user_id: orderData.user_id
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)

      if (itemsError) {
        // Rollback: delete the created order if items fail
        await supabase.from('orders').delete().eq('id', newOrder.id)
        throw itemsError
      }

      return { success: true, data: newOrder }
    } catch (error: any) {
      console.error('Create order with items error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateOrder(orderId: string, updates: TablesUpdate<'orders'>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Update order error:', error)
      return { success: false, error: error.message }
    }
  }

  // Payments methods (Updated)
  async getPayments(userId: string): Promise<PaymentWithOrder[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, orders(customer_name, total_price)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as PaymentWithOrder[]) || []
    } catch (error) {
      console.error('Get payments error:', error)
      return []
    }
  }

  async createPayment(paymentData: TablesInsert<'payments'>) {
    try {
      // Use a transaction to create payment and update order's amount_paid
      const { data, error } = await supabase.rpc('create_payment_and_update_order', {
        p_order_id: paymentData.order_id,
        p_user_id: paymentData.user_id,
        p_amount: paymentData.amount,
        p_payment_method: paymentData.payment_method
      })

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Create payment error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // ... (Customer and Dashboard methods can be added later)
}

export const supabaseService = new SupabaseService()