// Frontend Email Service - API Client untuk Backend
export interface VerificationEmail {
  email: string;
  code: string;
  expiresAt: Date;
  isUsed: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class EmailService {
  private apiBaseUrl: string;

  constructor() {
    // URL backend API
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  // Kirim email verifikasi via backend API
  async sendVerificationEmail(email: string): Promise<{ success: boolean; code?: string }> {
    console.log('📧 EmailService: Mengirim request ke backend API untuk:', email);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result: ApiResponse = await response.json();
      
      console.log('📬 EmailService: Response dari backend:', result);

      if (result.success) {
        console.log('✅ EmailService: Email berhasil dikirim via backend');
        return { 
          success: true, 
          code: result.data?.code // Hanya untuk development mode
        };
      } else {
        console.error('❌ EmailService: Backend error:', result.message);
        return { success: false };
      }
    } catch (error) {
      console.error('💥 EmailService: Network error:', error);
      return { success: false };
    }
  }

  // Verifikasi kode via backend API
  async verifyCode(email: string, inputCode: string): Promise<boolean> {
    console.log('🔍 EmailService: Mengirim request verifikasi ke backend untuk:', email);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: inputCode }),
      });

      const result: ApiResponse = await response.json();
      
      console.log('📋 EmailService: Response verifikasi dari backend:', result);

      if (result.success) {
        console.log('✅ EmailService: Kode berhasil diverifikasi via backend');
        return true;
      } else {
        console.error('❌ EmailService: Verifikasi gagal:', result.message);
        return false;
      }
    } catch (error) {
      console.error('💥 EmailService: Network error saat verifikasi:', error);
      return false;
    }
  }

  // Health check backend API
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      const result: ApiResponse = await response.json();
      
      console.log('🏥 EmailService: Backend health check:', result.success ? 'OK' : 'FAIL');
      return result.success;
    } catch (error) {
      console.error('💥 EmailService: Backend tidak dapat diakses:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
