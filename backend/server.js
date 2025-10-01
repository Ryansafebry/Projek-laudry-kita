require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = path;
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3001;

// Konfigurasi SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ [EMAIL] SendGrid API Key loaded.');
} else {
  console.warn('⚠️ [EMAIL] SendGrid API Key not found. Email sending will be simulated.');
}

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://127.0.0.1:49889'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory storage untuk development
let users = [];
let verificationCodes = new Map();

// Helper function untuk generate verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function untuk mengirim email verifikasi
async function sendVerificationEmail(email, code) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`📧 [SIMULATE] Verification code for ${email}: ${code}`);
    return; // Mode simulasi jika tidak ada API key
  }

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME,
    },
    subject: `Kode Verifikasi Anda untuk Laundry Kita`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0d9488; text-align: center;">Verifikasi Akun Laundry Kita</h2>
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar. Gunakan kode berikut untuk memverifikasi alamat email Anda:</p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f0fdfa; padding: 15px; border-radius: 5px; display: inline-block;">
            ${code}
          </p>
        </div>
        <p>Kode ini akan kedaluwarsa dalam 15 menit.</p>
        <p>Jika Anda tidak merasa mendaftar, silakan abaikan email ini.</p>
        <hr>
        <p style="font-size: 12px; color: #777; text-align: center;">© 2025 Laundry Kita</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ [EMAIL] Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ [EMAIL] Error sending email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
}


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  console.log('📥 [REGISTER] Request received:', req.body);
  
  const { fullName, username, email, password, phone } = req.body;
  
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  
  const lowerCaseEmail = email.toLowerCase();
  const lowerCaseUsername = username.toLowerCase();
  
  const existingUser = users.find(u => u.username.toLowerCase() === lowerCaseUsername || u.email === lowerCaseEmail);
  
  if (existingUser) {
    if (!existingUser.isEmailVerified) {
      const verificationCode = generateVerificationCode();
      verificationCodes.set(lowerCaseEmail, { code: verificationCode, expiresAt: new Date(Date.now() + 15 * 60 * 1000), isUsed: false });
      await sendVerificationEmail(lowerCaseEmail, verificationCode);
      return res.json({ success: true, message: 'Akun Anda sudah ada tetapi belum diverifikasi. Kode verifikasi baru telah dikirim.', email: lowerCaseEmail, needsVerification: true });
    } else {
      return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan' });
    }
  }
  
  const newUser = { id: Date.now().toString(), fullName, username, email: lowerCaseEmail, password, phone: phone || '', isEmailVerified: false, createdAt: new Date().toISOString() };
  users.push(newUser);
  
  const verificationCode = generateVerificationCode();
  verificationCodes.set(lowerCaseEmail, { code: verificationCode, expiresAt: new Date(Date.now() + 15 * 60 * 1000), isUsed: false });
  
  await sendVerificationEmail(lowerCaseEmail, verificationCode);
  
  res.status(201).json({ success: true, message: 'Registrasi berhasil, silakan verifikasi email Anda.', email: lowerCaseEmail, needsVerification: true });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('📥 [LOGIN] Request received:', req.body);
  
  const { identifier, password } = req.body;
  const lowerCaseIdentifier = identifier.toLowerCase();
  
  const user = users.find(u => (u.username.toLowerCase() === lowerCaseIdentifier || u.email === lowerCaseIdentifier) && u.password === password);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Username/email atau password salah' });
  }
  
  if (!user.isEmailVerified) {
    return res.status(401).json({ success: false, message: 'Email belum diverifikasi', email: user.email, needsVerification: true });
  }
  
  const { password: _, ...userResponse } = user;
  
  console.log(`✅ [LOGIN] Login successful for: ${user.email}`);
  res.json({ success: true, message: 'Login berhasil', user: userResponse });
});

// Verify email endpoint
app.post('/api/auth/verify-email', (req, res) => {
  console.log('📥 [VERIFY] Request received:', req.body);
  
  const { email, code } = req.body;
  const lowerCaseEmail = email.toLowerCase();
  
  const storedCode = verificationCodes.get(lowerCaseEmail);
  
  if (!storedCode || storedCode.isUsed || new Date() > storedCode.expiresAt || storedCode.code !== code) {
    return res.status(400).json({ success: false, message: 'Kode verifikasi tidak valid atau sudah kedaluwarsa' });
  }
  
  storedCode.isUsed = true;
  
  const userIndex = users.findIndex(u => u.email === lowerCaseEmail);
  if (userIndex > -1) {
    users[userIndex].isEmailVerified = true;
    console.log(`✅ [VERIFY] Email verified for: ${lowerCaseEmail}`);
  }
  
  res.json({ success: true, message: 'Email berhasil diverifikasi' });
});

// Send verification email endpoint (resend)
app.post('/api/send-verification-email', async (req, res) => {
  console.log('📥 [RESEND] Request received:', req.body);
  
  const { email } = req.body;
  const lowerCaseEmail = email.toLowerCase();

  const user = users.find(u => u.email === lowerCaseEmail);
  if (!user || user.isEmailVerified) {
    return res.status(400).json({ success: false, message: 'Tidak dapat mengirim ulang kode.' });
  }
  
  const verificationCode = generateVerificationCode();
  verificationCodes.set(lowerCaseEmail, { code: verificationCode, expiresAt: new Date(Date.now() + 15 * 60 * 1000), isUsed: false });
  
  await sendVerificationEmail(lowerCaseEmail, verificationCode);
  
  res.json({ success: true, message: 'Email verifikasi berhasil dikirim ulang' });
});

// Debug endpoints
app.get('/api/debug/users', (req, res) => {
  res.json({ success: true, users: users.map(u => ({ ...u, password: '***' })) });
});

app.get('/api/debug/codes', (req, res) => {
  const codes = Array.from(verificationCodes.entries()).map(([email, data]) => ({ email, code: data.code, expiresAt: data.expiresAt.toISOString(), isUsed: data.isUsed }));
  res.json({ success: true, codes });
});

app.delete('/api/debug/clear-users', (req, res) => {
  users = [];
  verificationCodes.clear();
  res.json({ success: true, message: 'Semua users dan verification codes telah dihapus' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log('🚀 Laundry Kita Backend Server');
  console.log(`🚀 Port: ${PORT}`);
  console.log(`📧 Email Service: ${process.env.SENDGRID_API_KEY ? 'SendGrid (Active)' : 'Simulation Mode'}`);
  console.log('🚀 ================================');
});

// Cleanup expired codes
setInterval(() => {
  const now = new Date();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
    }
  }
}, 5 * 60 * 1000);