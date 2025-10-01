import { supabase, Tables, TablesInsert, TablesUpdate } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export class SupabaseService {
  // Auth methods
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

  // Profile methods
  async getProfile(userId: string): Promise<Tables<'profiles'> | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
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

  // Orders methods
  async getOrders(userId: string): Promise<Tables<'orders'>[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get orders error:', error)
      return []
    }
  }

  async createOrder(orderData: TablesInsert<'orders'>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Create order error:', error)
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

  async deleteOrder(orderId: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Delete order error:', error)
      return { success: false, error: error.message }
    }
  }

  // Customers methods
  async getCustomers(userId: string): Promise<Tables<'customers'>[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get customers error:', error)
      return []
    }
  }

  async createCustomer(customerData: TablesInsert<'customers'>) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Create customer error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateCustomer(customerId: string, updates: TablesUpdate<'customers'>) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', customerId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Update customer error:', error)
      return { success: false, error: error.message }
    }
  }

  // Payments methods
  async getPayments(userId: string): Promise<Tables<'payments'>[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            customer_name,
            service_type,
            total_price
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get payments error:', error)
      return []
    }
  }

  async createPayment(paymentData: TablesInsert<'payments'>) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Create payment error:', error)
      return { success: false, error: error.message }
    }
  }

  // Dashboard statistics
  async getDashboardStats(userId: string) {
    try {
      // Get orders count and revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_price, status, created_at')
        .eq('user_id', userId)

      if (ordersError) throw ordersError

      // Get payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, payment_status, created_at')
        .eq('user_id', userId)

      if (paymentsError) throw paymentsError

      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = orders?.filter(order => 
        order.created_at.startsWith(today)
      ) || []

      const todayPayments = payments?.filter(payment => 
        payment.created_at.startsWith(today) && payment.payment_status === 'paid'
      ) || []

      const totalRevenue = payments?.reduce((sum, payment) => 
        payment.payment_status === 'paid' ? sum + payment.amount : sum, 0
      ) || 0

      const todayRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0)

      return {
        success: true,
        data: {
          totalOrders: orders?.length || 0,
          todayOrders: todayOrders.length,
          totalRevenue,
          todayRevenue,
          pendingOrders: orders?.filter(order => order.status === 'pending').length || 0,
          completedOrders: orders?.filter(order => order.status === 'completed').length || 0
        }
      }
    } catch (error: any) {
      console.error('Get dashboard stats error:', error)
      return { success: false, error: error.message }
    }
  }

  // Real-time subscriptions
  subscribeToOrders(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  subscribeToPayments(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

export const supabaseService = new SupabaseService()