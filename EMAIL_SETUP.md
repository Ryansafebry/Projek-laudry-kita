# 📧 Email Service Setup Guide

Aplikasi Laundry Kita sekarang mendukung **4 provider email** untuk mengirim email verifikasi real:

## 🚀 Quick Start

1. **Copy file environment**:
   ```bash
   cp .env.example .env
   ```

2. **Pilih provider email** di `.env`:
   ```env
   VITE_EMAIL_PROVIDER=sendgrid  # atau nodemailer, aws-ses, mailgun
   ```

3. **Konfigurasi provider yang dipilih** (lihat detail di bawah)

## 📋 Provider Email yang Didukung

### 1. 🟢 SendGrid (Recommended)

**Kelebihan**: Mudah setup, reliable, free tier 100 email/hari

**Setup**:
1. Daftar di [SendGrid](https://sendgrid.com)
2. Buat API Key di Settings → API Keys
3. Verify sender email di Settings → Sender Authentication

**Environment Variables**:
```env
VITE_EMAIL_PROVIDER=sendgrid
VITE_SENDGRID_API_KEY=SG.your_api_key_here
VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com
VITE_SENDGRID_FROM_NAME=Laundry Kita
```

### 2. 📧 Nodemailer + SMTP

**Kelebihan**: Fleksibel, bisa pakai Gmail/Outlook/custom SMTP

**Setup Gmail**:
1. Enable 2FA di Google Account
2. Generate App Password di Security → App passwords
3. Gunakan app password sebagai VITE_SMTP_PASS

**Environment Variables**:
```env
VITE_EMAIL_PROVIDER=nodemailer
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASS=your_app_password
VITE_SMTP_FROM_EMAIL=your_email@gmail.com
VITE_SMTP_FROM_NAME=Laundry Kita
```

### 3. ☁️ AWS SES

**Kelebihan**: Scalable, terintegrasi dengan AWS ecosystem

**Setup**:
1. Setup AWS SES di AWS Console
2. Verify domain/email di SES
3. Buat IAM user dengan SES permissions
4. Get Access Key & Secret Key

**Environment Variables**:
```env
VITE_EMAIL_PROVIDER=aws-ses
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
VITE_AWS_SES_FROM_EMAIL=noreply@yourdomain.com
VITE_AWS_SES_FROM_NAME=Laundry Kita
```

### 4. 🔫 Mailgun

**Kelebihan**: Developer-friendly, good deliverability

**Setup**:
1. Daftar di [Mailgun](https://mailgun.com)
2. Add domain dan verify DNS
3. Get API Key dari dashboard

**Environment Variables**:
```env
VITE_EMAIL_PROVIDER=mailgun
VITE_MAILGUN_API_KEY=your_api_key
VITE_MAILGUN_DOMAIN=your_domain.com
VITE_MAILGUN_FROM_EMAIL=noreply@your_domain.com
VITE_MAILGUN_FROM_NAME=Laundry Kita
```

## 🛠️ Development Mode

Untuk testing tanpa setup provider email:

```env
VITE_EMAIL_PROVIDER=development
```

Mode ini akan:
- ✅ Tampilkan kode di console browser
- ✅ Tampilkan alert popup dengan kode
- ✅ Tidak kirim email real

## 🎨 Email Template

Email menggunakan template HTML yang responsive dengan:
- ✅ Logo dan branding Laundry Kita
- ✅ Kode verifikasi yang jelas
- ✅ Tombol CTA untuk verifikasi
- ✅ Link fallback jika tombol tidak berfungsi
- ✅ Mobile-friendly design

## 🔧 Troubleshooting

### SendGrid Issues
- **Error 401**: API key salah atau tidak valid
- **Error 403**: Sender email belum diverifikasi
- **Solution**: Verify sender di SendGrid dashboard

### Gmail SMTP Issues
- **Error 535**: Password salah
- **Solution**: Gunakan App Password, bukan password biasa
- **Error 534**: 2FA belum enabled
- **Solution**: Enable 2FA terlebih dahulu

### AWS SES Issues
- **Error AccessDenied**: IAM permissions kurang
- **Solution**: Tambah policy `AmazonSESFullAccess`
- **Email not sent**: Domain/email belum verified
- **Solution**: Verify di SES console

### Mailgun Issues
- **Error 401**: API key salah
- **Error 400**: Domain belum verified
- **Solution**: Setup DNS records sesuai instruksi Mailgun

## 📊 Monitoring

Cek logs di browser console untuk:
- ✅ Status pengiriman email
- ❌ Error messages
- 📧 Email delivery confirmation

## 🔒 Security Best Practices

1. **Jangan commit API keys** ke repository
2. **Gunakan environment variables** untuk semua credentials
3. **Rotate API keys** secara berkala
4. **Monitor email usage** untuk detect abuse
5. **Implement rate limiting** untuk prevent spam

## 🚀 Production Deployment

Untuk production, pastikan:

1. **Set environment variables** di hosting platform
2. **Verify domain** di email provider
3. **Setup SPF/DKIM records** untuk better deliverability
4. **Monitor email metrics** (open rate, bounce rate)
5. **Setup webhooks** untuk email events (optional)

## 📞 Support

Jika ada masalah dengan setup email:

1. Cek console browser untuk error messages
2. Verify API keys dan credentials
3. Test dengan development mode dulu
4. Cek dokumentasi provider email
5. Contact support provider jika perlu

---

**Happy Coding! 🎉**
