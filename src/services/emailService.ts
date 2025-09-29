// Simulasi service untuk pengiriman email verifikasi
// Dalam implementasi nyata, ini akan menggunakan service email seperti SendGrid, Nodemailer, dll.

export interface VerificationEmail {
  email: string;
  code: string;
  expiresAt: Date;
  isUsed: boolean;
}

class EmailService {
  private verificationCodes: Map<string, VerificationEmail> = new Map();

  // Generate kode verifikasi 6 digit
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Simulasi pengiriman email verifikasi
  async sendVerificationEmail(email: string): Promise<{ success: boolean; code?: string }> {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Berlaku 15 menit

      const verificationData: VerificationEmail = {
        email,
        code,
        expiresAt,
        isUsed: false
      };

      // Simpan kode verifikasi (dalam implementasi nyata, ini akan disimpan di database)
      this.verificationCodes.set(email, verificationData);

      // Simulasi pengiriman email
      console.log(`📧 Email verifikasi dikirim ke: ${email}`);
      console.log(`🔑 Kode verifikasi: ${code}`);
      console.log(`⏰ Berlaku hingga: ${expiresAt.toLocaleString()}`);

      // Simulasi delay pengiriman email
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true, code }; // Dalam implementasi nyata, jangan return code
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false };
    }
  }

  // Verifikasi kode yang dimasukkan user
  verifyCode(email: string, inputCode: string): boolean {
    const verificationData = this.verificationCodes.get(email);
    
    if (!verificationData) {
      console.log('❌ Kode verifikasi tidak ditemukan untuk email:', email);
      return false;
    }

    if (verificationData.isUsed) {
      console.log('❌ Kode verifikasi sudah digunakan');
      return false;
    }

    if (new Date() > verificationData.expiresAt) {
      console.log('❌ Kode verifikasi sudah kedaluwarsa');
      return false;
    }

    if (verificationData.code !== inputCode) {
      console.log('❌ Kode verifikasi tidak cocok');
      return false;
    }

    // Tandai kode sebagai sudah digunakan
    verificationData.isUsed = true;
    this.verificationCodes.set(email, verificationData);

    console.log('✅ Kode verifikasi berhasil diverifikasi');
    return true;
  }

  // Hapus kode verifikasi yang sudah kedaluwarsa
  cleanupExpiredCodes(): void {
    const now = new Date();
    for (const [email, data] of this.verificationCodes.entries()) {
      if (now > data.expiresAt) {
        this.verificationCodes.delete(email);
      }
    }
  }

  // Cek apakah email sudah terverifikasi
  isEmailVerified(email: string): boolean {
    const verificationData = this.verificationCodes.get(email);
    return verificationData ? verificationData.isUsed : false;
  }

  // Simulasi template email (dalam implementasi nyata, ini akan menggunakan template HTML)
  private getEmailTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Verifikasi Email - Laundry Kita</h2>
        <p>Terima kasih telah mendaftar di Laundry Kita!</p>
        <p>Gunakan kode verifikasi berikut untuk mengaktifkan akun Anda:</p>
        <div style="background: #f0fdfa; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #0d9488; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p>Kode ini berlaku selama 15 menit.</p>
        <p>Jika Anda tidak mendaftar di Laundry Kita, abaikan email ini.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #64748b; font-size: 12px;">© 2025 Laundry Kita. All rights reserved.</p>
      </div>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Cleanup expired codes setiap 5 menit
setInterval(() => {
  emailService.cleanupExpiredCodes();
}, 5 * 60 * 1000);
