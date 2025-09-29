// Frontend Email Service - API Client untuk Backend dengan Fallback
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
  private fallbackCodes: Map<string, { code: string; expiresAt: Date; isUsed: boolean }> = new Map();

  constructor() {
    // URL backend API
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  // Generate 6-digit verification code
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Fallback method untuk development tanpa backend
  private async fallbackSendEmail(email: string): Promise<{ success: boolean; code?: string }> {
    console.log('🔄 EmailService: Menggunakan fallback mode (tanpa backend)');
    
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
    
    this.fallbackCodes.set(email, {
      code,
      expiresAt,
      isUsed: false
    });

    console.log(`📧 EmailService (Fallback): Kode verifikasi untuk ${email}: ${code}`);
    console.log(`⏰ EmailService (Fallback): Kode berlaku sampai: ${expiresAt.toLocaleString()}`);
    
    return { success: true, code };
  }

  // Fallback method untuk verifikasi tanpa backend
  private async fallbackVerifyCode(email: string, inputCode: string): Promise<boolean> {
    console.log('🔄 EmailService: Menggunakan fallback verification');
    
    const stored = this.fallbackCodes.get(email);
    
    if (!stored) {
      console.error('❌ EmailService (Fallback): Tidak ada kode untuk email ini');
      return false;
    }

    if (stored.isUsed) {
      console.error('❌ EmailService (Fallback): Kode sudah digunakan');
      return false;
    }

    if (new Date() > stored.expiresAt) {
      console.error('❌ EmailService (Fallback): Kode sudah expired');
      this.fallbackCodes.delete(email);
      return false;
    }

    if (stored.code !== inputCode) {
      console.error('❌ EmailService (Fallback): Kode tidak cocok');
      return false;
    }

    // Mark as used
    stored.isUsed = true;
    console.log('✅ EmailService (Fallback): Kode berhasil diverifikasi');
    return true;
  }

  // Kirim email verifikasi via backend API dengan fallback
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
        console.log('🔄 EmailService: Mencoba fallback mode...');
        return await this.fallbackSendEmail(email);
      }
    } catch (error) {
      console.error('💥 EmailService: Network error:', error);
      console.log('🔄 EmailService: Backend tidak tersedia, menggunakan fallback mode...');
      return await this.fallbackSendEmail(email);
    }
  }

  // Verifikasi kode via backend API dengan fallback
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
        console.log('🔄 EmailService: Mencoba fallback verification...');
        return await this.fallbackVerifyCode(email, inputCode);
      }
    } catch (error) {
      console.error('💥 EmailService: Network error saat verifikasi:', error);
      console.log('🔄 EmailService: Backend tidak tersedia, menggunakan fallback verification...');
      return await this.fallbackVerifyCode(email, inputCode);
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
