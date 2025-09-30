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
  // Register user baru
  async register(userData: RegisterData): Promise<ApiResponse> {
    try {
      console.log('🔄 AuthService: Mengirim request register ke backend...');
      console.log('🌐 AuthService: API_BASE_URL:', API_BASE_URL);
      console.log('📤 AuthService: Request data:', userData);
      
      const url = `${API_BASE_URL}/api/auth/register`;
      console.log('🎯 AuthService: Full URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

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
    } catch (error) {
      console.error('❌ AuthService: Error saat register:', error);
      console.error('❌ AuthService: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return {
        success: false,
        message: 'Gagal terhubung ke server'
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
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

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
    } catch (error) {
      console.error('❌ AuthService: Error saat login:', error);
      console.error('❌ AuthService: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return {
        success: false,
        message: 'Gagal terhubung ke server'
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
      
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
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
