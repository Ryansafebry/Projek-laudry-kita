import { supabase } from "../lib/supabase";
import { User } from "../types";

export const supabaseService = {
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }
    return data.user;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  },

  async createProfileFromUser(user: any) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: user.id,
          full_name: user.user_metadata.fullName || 'New User',
          username: user.user_metadata.username || user.email,
          email: user.email,
          phone: user.user_metadata.phone,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId);
    if (error) {
      console.error("Error updating profile:", error);
    }
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { success: !error, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  },

  async signUp(email: string, password: string, metadata: any) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName,
          username: metadata.username,
          phone: metadata.phone,
        },
      },
    });
    return { success: !error, error };
  },

  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
    return data;
  },

  async getOrderById(orderId: string, userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single();
    if (error) {
      console.error("Error fetching order details:", error);
      return null;
    }
    return data;
  },

  async createOrderWithItems(orderData: any, itemsData: any[]) {
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return { success: false, error: orderError };
    }

    const itemsToInsert = itemsData.map(item => ({
      ...item,
      order_id: newOrder.id,
      user_id: orderData.user_id,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      return { success: false, error: itemsError };
    }

    return { success: true, data: newOrder };
  },

  async updateOrder(orderId: string, updates: any) {
    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);
    if (error) {
      console.error("Error updating order:", error);
    }
  },

  async getCustomers(userId: string) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
    return data;
  },

  async getPayments(userId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("Error fetching payments:", error);
      return [];
    }
    return data;
  },

  async createPayment(paymentData: any) {
    const { error } = await supabase.from("payments").insert(paymentData);
    if (error) {
      console.error("Error creating payment:", error);
    }
  },

  async processFullPayment(orderId: string, userId: string, amount: number, paymentMethod: string = 'Tunai') {
    const { error } = await supabase.rpc('create_payment_and_update_order', {
      p_order_id: orderId,
      p_user_id: userId,
      p_amount: amount,
      p_payment_method: paymentMethod,
    });

    if (error) {
      console.error('Error processing payment:', error);
      return { success: false, error };
    }

    return { success: true };
  },
};