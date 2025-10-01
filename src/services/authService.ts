import { User } from '../types';

// Gunakan relative URL untuk memanfaatkan Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginData {
  identifier: string; // bisa username atau email
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: User;
  email?: string;
  needsVerification?: boolean;
  emailError?: boolean;
}

class AuthService {
  // Helper method untuk membuat fetch request dengan timeout
  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Register user baru
  async register(userData: RegisterData): Promise<ApiResponse> {
    try {
      console.log('🔄 AuthService: Mengirim request register ke backend...');
      console.log('🌐 AuthService: API_BASE_URL:', API_BASE_URL);
      console.log('📤 AuthService: Request data:', userData);
      
      const url = `${API_BASE_URL}/api/auth/register`;
      console.log('🎯 AuthService: Full URL:', url);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }, 5000);

      console.log('📡 AuthService: Response status:', response.status);
      console.log('📡 AuthService: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AuthService: Response error:', errorText);
        return {
          success: false,
          message: `Server error: ${response.status}`
        };
      }

      const result = await response.json();
      console.log('📥 AuthService: Response register dari backend:', result);
      
      return result;
    } catch (error: any) {
      console.error('❌ AuthService: Error saat register:', error);
      console.error('❌ AuthService: Error details:', {
        name: error?.name || 'Unknown',
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace'
      });
      
      let errorMessage = 'Gagal terhubung ke server';
      if (error?.name === 'AbortError') {
        errorMessage = 'Request timeout - server tidak merespons';
      } else if (error?.message?.includes('fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server';
      } else if (error?.message?.includes('CORS')) {
        errorMessage = 'CORS error - konfigurasi server bermasalah';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Login user
  async login(loginData: LoginData): Promise<ApiResponse> {
    try {
      console.log('🔄 AuthService: Mengirim request login ke backend...');
      console.log('🌐 AuthService: API_BASE_URL:', API_BASE_URL);
      console.log('📤 AuthService: Login data:', loginData);
      
      const url = `${API_BASE_URL}/api/auth/login`;
      console.log('🎯 AuthService: Full URL:', url);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      }, 5000);

      console.log('📡 AuthService: Response status:', response.status);
      console.log('📡 AuthService: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AuthService: Response error:', errorText);
        return {
          success: false,
          message: `Server error: ${response.status}`
        };
      }

      const result = await response.json();
      console.log('📥 AuthService: Response login dari backend:', result);
      
      return result;
    } catch (error: any) {
      console.error('❌ AuthService: Error saat login:', error);
      console.error('❌ AuthService: Error details:', {
        name: error?.name || 'Unknown',
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace'
      });
      
      let errorMessage = 'Gagal terhubung ke server';
      if (error?.name === 'AbortError') {
        errorMessage = 'Request timeout - server tidak merespons';
      } else if (error?.message?.includes('fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server';
      } else if (error?.message?.includes('CORS')) {
        errorMessage = 'CORS error - konfigurasi server bermasalah';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Verifikasi email
  async verifyEmail(email: string, code: string): Promise<ApiResponse> {
    try {
      console.log('🔄 AuthService: Mengirim request verifikasi email ke backend...');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();
      console.log('📥 AuthService: Response verifikasi email dari backend:', result);
      
      return result;
    } catch (error) {
      console.error('❌ AuthService: Error saat verifikasi email:', error);
      return {
        success: false,
        message: 'Gagal terhubung ke server'
      };
    }
  }

  // Kirim ulang email verifikasi
  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    try {
      console.log('🔄 AuthService: Mengirim request kirim ulang email verifikasi...');
      
      const response = await fetch(`${API_BASE_URL}/api/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      console.log('📥 AuthService: Response kirim ulang email dari backend:', result);
      
      return result;
    } catch (error) {
      console.error('❌ AuthService: Error saat kirim ulang email:', error);
      return {
        success: false,
        message: 'Gagal terhubung ke server'
      };
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ AuthService: Error saat get user profile:', error);
      return {
        success: false,
        message: 'Gagal terhubung ke server'
      };
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updateData: Partial<User>): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ AuthService: Error saat update user profile:', error);
      return {
        success: false,
        message: 'Gagal terhubung ke server'
      };
    }
  }

  // Get user statistics (admin only)
  async getUserStats(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ AuthService: Error saat get user stats:', error);
      return {
        success: false,
        message: 'Gagal terhubung ke server'
      };
    }
  }
}

export default new AuthService();