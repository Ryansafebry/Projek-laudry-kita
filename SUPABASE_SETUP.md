# 🚀 Supabase Integration Setup

Aplikasi Laundry Kita sekarang mendukung integrasi dengan Supabase untuk penyimpanan data multi-user yang terpisah.

## 📋 Prerequisites

1. **Akun Supabase** - Daftar di [supabase.com](https://supabase.com)
2. **Project Supabase** - Buat project baru di dashboard Supabase

## 🔧 Setup Steps

### 1. Buat Project Supabase

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik "New Project"
3. Pilih organization dan isi detail project:
   - **Name**: `laundry-kita`
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih yang terdekat (Singapore/Asia Southeast)

### 2. Setup Database Schema

1. Buka **SQL Editor** di dashboard Supabase
2. Copy dan paste isi file `supabase-schema.sql`
3. Klik **Run** untuk membuat semua tables dan policies

### 3. Konfigurasi Environment Variables

1. Di dashboard Supabase, buka **Settings** → **API**
2. Copy **Project URL** dan **anon public key**
3. Update file `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Enable Email Authentication (Opsional)

1. Buka **Authentication** → **Settings**
2. Konfigurasi email provider (SMTP/SendGrid/dll)
3. Enable email confirmation jika diperlukan

## 🏗️ Database Structure

### Tables Created:

1. **profiles** - User profile data
   - Linked to `auth.users` via `user_id`
   - Stores: full_name, username, email, phone, bio, avatar_url

2. **orders** - Order data per user
   - Linked to user via `user_id`
   - Stores: customer info, service details, pricing, status, dates

3. **payments** - Payment records per user
   - Linked to orders and users
   - Stores: amount, method, status, dates

4. **customers** - Customer data per user
   - Linked to user via `user_id`
   - Stores: contact info, order history, spending totals

### Row Level Security (RLS):

- ✅ **Enabled** untuk semua tables
- ✅ **Policies** memastikan user hanya bisa akses data mereka sendiri
- ✅ **Automatic triggers** untuk updated_at timestamps

## 🎯 Features

### Multi-User Support
- ✅ Setiap user memiliki data terpisah
- ✅ Orders, customers, payments isolated per user
- ✅ Real-time updates via Supabase subscriptions

### Data Persistence
- ✅ Data tersimpan permanen di cloud
- ✅ Backup otomatis
- ✅ Akses dari berbagai device

### Security
- ✅ Row Level Security (RLS)
- ✅ JWT-based authentication
- ✅ API rate limiting

## 🔄 Usage

### Toggle Storage Mode

Aplikasi mendukung 2 mode storage:

1. **Local Storage Mode** (Default)
   - Data disimpan di browser localStorage
   - Cocok untuk development/testing
   - Single user, tidak persistent

2. **Supabase Mode**
   - Data disimpan di Supabase database
   - Multi-user support
   - Persistent dan real-time sync

### Switch Mode

```typescript
import { useAuth } from '@/context/AuthContext'

const { useSupabase, setUseSupabase } = useAuth()

// Switch to Supabase mode
setUseSupabase(true)

// Switch to localStorage mode
setUseSupabase(false)
```

### Authentication

```typescript
// Supabase authentication
const { supabaseLogin, supabaseRegister } = useAuth()

// Login
await supabaseLogin(email, password)

// Register
await supabaseRegister({
  fullName: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  password: 'password123',
  phone: '081234567890'
})
```

## 📊 Dashboard Integration

Dashboard akan otomatis menampilkan data berdasarkan mode yang aktif:

- **Local Mode**: Data dari localStorage
- **Supabase Mode**: Data dari database dengan real-time updates

## 🔍 Development

### Testing

1. Start dengan localStorage mode untuk development cepat
2. Switch ke Supabase mode untuk testing multi-user
3. Gunakan Supabase dashboard untuk monitoring data

### Database Queries

Semua query database sudah dihandle oleh `SupabaseService`:

```typescript
import { supabaseService } from '@/services/supabaseService'

// Get user orders
const orders = await supabaseService.getOrders(userId)

// Create new order
const result = await supabaseService.createOrder(orderData)

// Get dashboard stats
const stats = await supabaseService.getDashboardStats(userId)
```

## 🚨 Important Notes

1. **Environment Variables**: Pastikan `.env` sudah dikonfigurasi dengan benar
2. **Database Schema**: Jalankan `supabase-schema.sql` sebelum menggunakan
3. **RLS Policies**: Jangan disable RLS untuk keamanan data
4. **API Limits**: Perhatikan limits Supabase free tier

## 🎉 Ready to Use!

Setelah setup selesai, aplikasi akan mendukung:
- ✅ Multi-user registration dan login
- ✅ Data terpisah per user
- ✅ Real-time synchronization
- ✅ Persistent cloud storage
- ✅ Scalable architecture

Selamat menggunakan Supabase integration! 🚀
