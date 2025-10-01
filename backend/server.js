const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('📥 [REGISTER] Request received:', req.body);
  
  const { fullName, username, email, password, phone } = req.body;
  
  // Validasi input
  if (!fullName || !username || !email || !password) {
    console.log('❌ [REGISTER] Validation failed: Missing fields');
    return res.status(400).json({
      success: false,
      message: 'Semua field wajib diisi'
    });
  }
  
  const lowerCaseEmail = email.toLowerCase();
  const lowerCaseUsername = username.toLowerCase();
  
  // Cek duplikasi (case-insensitive)
  const existingUser = users.find(u => u.username.toLowerCase() === lowerCaseUsername || u.email === lowerCaseEmail);
  
  if (existingUser) {
    console.log(`🤔 [REGISTER] User found for email/username: ${lowerCaseEmail}/${lowerCaseUsername}`);
    // Jika user ada tapi belum verifikasi, anggap ini sebagai pendaftaran ulang / kirim ulang kode
    if (!existingUser.isEmailVerified) {
      console.log(`✅ [REGISTER] User is not verified. Resending verification code.`);
      const verificationCode = generateVerificationCode();
      verificationCodes.set(lowerCaseEmail, {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        isUsed: false
      });
      
      // Update user data in case they changed something like fullName
      existingUser.fullName = fullName;
      existingUser.password = password;
      existingUser.phone = phone || '';
      
      return res.json({
        success: true,
        message: 'Akun Anda sudah ada tetapi belum diverifikasi. Kode verifikasi baru telah dikirim.',
        email: lowerCaseEmail,
        needsVerification: true,
        data: {
          code: verificationCode // Hanya untuk development
        }
      });
    } else {
      // Jika user ada dan sudah terverifikasi, ini adalah duplikat
      console.log(`❌ [REGISTER] User is already verified. Duplicate account.`);
      return res.status(400).json({
        success: false,
        message: 'Username atau email sudah digunakan'
      });
    }
  }
  
  // Buat user baru
  console.log(`✅ [REGISTER] Creating new user for ${lowerCaseEmail}`);
  const newUser = {
    id: Date.now().toString(),
    fullName,
    username, // Simpan username dengan casing asli untuk display
    email: lowerCaseEmail, // Simpan email dalam lowercase
    password, // Dalam production, hash password ini
    phone: phone || '',
    isEmailVerified: false,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Generate verification code
  const verificationCode = generateVerificationCode();
  verificationCodes.set(lowerCaseEmail, {
    code: verificationCode,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 menit
    isUsed: false
  });
  
  console.log(`📧 [REGISTER] Verification code for ${lowerCaseEmail}: ${verificationCode}`);
  
  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil, silakan verifikasi email Anda.',
    email: lowerCaseEmail,
    needsVerification: true,
    data: {
      code: verificationCode // Hanya untuk development
    }
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('📥 [LOGIN] Request received:', req.body);
  
  const { identifier, password } = req.body;
  const lowerCaseIdentifier = identifier.toLowerCase();
  
  // Cari user berdasarkan username atau email (case-insensitive)
  const user = users.find(u => 
    (u.username.toLowerCase() === lowerCaseIdentifier || u.email === lowerCaseIdentifier) && u.password === password
  );
  
  if (!user) {
    console.log(`❌ [LOGIN] Invalid credentials for: ${lowerCaseIdentifier}`);
    return res.status(401).json({
      success: false,
      message: 'Username/email atau password salah'
    });
  }
  
  if (!user.isEmailVerified) {
    console.log(`🤔 [LOGIN] User not verified: ${user.email}`);
    return res.status(401).json({
      success: false,
      message: 'Email belum diverifikasi',
      email: user.email,
      needsVerification: true
    });
  }
  
  // Remove password dari response
  const { password: _, ...userResponse } = user;
  
  console.log(`✅ [LOGIN] Login successful for: ${user.email}`);
  res.json({
    success: true,
    message: 'Login berhasil',
    user: userResponse
  });
});

// Verify email endpoint
app.post('/api/auth/verify-email', (req, res) => {
  console.log('📥 [VERIFY] Request received:', req.body);
  
  const { email, code } = req.body;
  const lowerCaseEmail = email.toLowerCase();
  
  const storedCode = verificationCodes.get(lowerCaseEmail);
  
  if (!storedCode) {
    console.log(`❌ [VERIFY] No code found for: ${lowerCaseEmail}`);
    return res.status(400).json({
      success: false,
      message: 'Kode verifikasi tidak valid atau sudah kedaluwarsa'
    });
  }
  
  if (storedCode.isUsed || new Date() > storedCode.expiresAt || storedCode.code !== code) {
    console.log(`❌ [VERIFY] Code invalid/expired/used for: ${lowerCaseEmail}`);
    return res.status(400).json({
      success: false,
      message: 'Kode verifikasi tidak valid atau sudah kedaluwarsa'
    });
  }
  
  // Mark code as used
  storedCode.isUsed = true;
  
  // Update user verification status
  const userIndex = users.findIndex(u => u.email === lowerCaseEmail);
  if (userIndex > -1) {
    users[userIndex].isEmailVerified = true;
    console.log(`✅ [VERIFY] Email verified for: ${lowerCaseEmail}`);
  } else {
    console.log(`⚠️ [VERIFY] User not found to update status for: ${lowerCaseEmail}`);
  }
  
  res.json({
    success: true,
    message: 'Email berhasil diverifikasi'
  });
});

// Send verification email endpoint (resend)
app.post('/api/send-verification-email', (req, res) => {
  console.log('📥 [RESEND] Request received:', req.body);
  
  const { email } = req.body;
  const lowerCaseEmail = email.toLowerCase();

  const user = users.find(u => u.email === lowerCaseEmail);
  if (!user || user.isEmailVerified) {
    console.log(`❌ [RESEND] Cannot resend for verified or non-existent user: ${lowerCaseEmail}`);
    return res.status(400).json({ success: false, message: 'Tidak dapat mengirim ulang kode.' });
  }
  
  // Generate new verification code
  const verificationCode = generateVerificationCode();
  verificationCodes.set(lowerCaseEmail, {
    code: verificationCode,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 menit
    isUsed: false
  });
  
  console.log(`📧 [RESEND] New verification code for ${lowerCaseEmail}: ${verificationCode}`);
  
  res.json({
    success: true,
    message: 'Email verifikasi berhasil dikirim ulang',
    data: {
      code: verificationCode // Hanya untuk development
    }
  });
});

// Debug endpoints
app.get('/api/debug/users', (req, res) => {
  res.json({
    success: true,
    users: users.map(u => ({ ...u, password: '***' }))
  });
});

app.get('/api/debug/codes', (req, res) => {
  const codes = Array.from(verificationCodes.entries()).map(([email, data]) => ({
    email,
    code: data.code,
    expiresAt: data.expiresAt.toISOString(),
    isUsed: data.isUsed
  }));
  
  res.json({
    success: true,
    codes
  });
});

// Clear all users (untuk testing)
app.delete('/api/debug/clear-users', (req, res) => {
  users = [];
  verificationCodes.clear();
  console.log('🧹 [DEBUG] All users and codes have been cleared');
  
  res.json({
    success: true,
    message: 'Semua users dan verification codes telah dihapus'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log('🚀 Laundry Kita Backend Server');
  console.log('🚀 Environment: development');
  console.log(`🚀 Port: ${PORT}`);
  console.log('🚀 ================================');
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`📧 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Debug users: http://localhost:${PORT}/api/debug/users`);
  console.log(`🔍 Debug codes: http://localhost:${PORT}/api/debug/codes`);
  console.log('🚀 ================================');
});

// Cleanup expired codes every 5 minutes
setInterval(() => {
  const now = new Date();
  let cleanedCount = 0;
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
      cleanedCount++;
    }
  }
  if (cleanedCount > 0) {
    console.log(`🧹 [CLEANUP] Cleaned up ${cleanedCount} expired code(s)`);
  }
}, 5 * 60 * 1000);