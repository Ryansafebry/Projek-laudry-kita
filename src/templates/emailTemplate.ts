export interface EmailTemplateData {
  code: string;
  email: string;
  appName: string;
  appUrl: string;
  expiresIn: string;
}

export const getVerificationEmailTemplate = (data: EmailTemplateData): string => {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Email - ${data.appName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            background: linear-gradient(135deg, #0d9488, #14b8a6);
            color: white;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .title {
            color: #0d9488;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }
        .subtitle {
            color: #64748b;
            font-size: 16px;
            margin: 10px 0 0 0;
        }
        .content {
            margin: 30px 0;
        }
        .verification-code {
            background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
            border: 2px solid #0d9488;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            color: #0d9488;
            letter-spacing: 8px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
        }
        .code-label {
            color: #0d9488;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #0d9488, #14b8a6);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
        }
        .info-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #0d9488;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .code {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">👕</div>
            <h1 class="title">${data.appName}</h1>
            <p class="subtitle">Verifikasi Email Anda</p>
        </div>
        
        <div class="content">
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar di <strong>${data.appName}</strong>! Untuk mengaktifkan akun Anda, silakan verifikasi alamat email ini dengan menggunakan kode verifikasi di bawah:</p>
            
            <div class="verification-code">
                <div class="code-label">Kode Verifikasi</div>
                <div class="code">${data.code}</div>
                <p style="margin: 15px 0 0 0; color: #64748b; font-size: 14px;">
                    Masukkan kode ini di halaman verifikasi
                </p>
            </div>
            
            <div style="text-align: center;">
                <a href="${data.appUrl}/verify-email?email=${encodeURIComponent(data.email)}&code=${data.code}" class="button">
                    Verifikasi Email Sekarang
                </a>
            </div>
            
            <div class="info-box">
                <strong>⚠️ Penting:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Kode ini berlaku selama <strong>${data.expiresIn}</strong></li>
                    <li>Jangan bagikan kode ini kepada siapa pun</li>
                    <li>Jika Anda tidak mendaftar, abaikan email ini</li>
                </ul>
            </div>
            
            <p>Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #0d9488; font-size: 14px;">
                ${data.appUrl}/verify-email?email=${encodeURIComponent(data.email)}&code=${data.code}
            </p>
        </div>
        
        <div class="footer">
            <p>Email ini dikirim otomatis, mohon jangan membalas.</p>
            <div class="social-links">
                <a href="#">Bantuan</a> |
                <a href="#">Kebijakan Privasi</a> |
                <a href="#">Syarat & Ketentuan</a>
            </div>
            <p>&copy; 2025 ${data.appName}. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
};

export const getVerificationEmailText = (data: EmailTemplateData): string => {
  return `
Verifikasi Email - ${data.appName}

Halo,

Terima kasih telah mendaftar di ${data.appName}!

Kode Verifikasi Anda: ${data.code}

Kode ini berlaku selama ${data.expiresIn}.

Untuk verifikasi, kunjungi:
${data.appUrl}/verify-email?email=${encodeURIComponent(data.email)}&code=${data.code}

Jika Anda tidak mendaftar di ${data.appName}, abaikan email ini.

---
${data.appName} Team
© 2025 ${data.appName}. Semua hak dilindungi.
  `.trim();
};
