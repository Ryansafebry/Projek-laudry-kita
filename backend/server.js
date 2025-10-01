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
  console.log('📥 Register request received:', req.body);
  
  const { fullName, username, email, password, phone } = req.body;
  
  // Validasi input
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Semua field wajib diisi'
    });
  }
  
  // Cek duplikasi
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    // Jika user ada tapi belum verifikasi, kirim ulang kode
    if (!existingUser.isEmailVerified) {
      console.log(`🤔 User ${email} exists but is not verified. Resending verification code.`);
      const verificationCode = generateVerificationCode();
      verificationCodes.set(email, {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        isUsed: false
      });
      
      return res.json({
        success: true,
        message: 'Registrasi berhasil, silakan verifikasi email Anda.',
        email: email,
        data: {
          code: verificationCode // Hanya untuk development
        }
      });
    } else {
      // Jika user ada dan sudah terverifikasi, ini adalah duplikat
      return res.status(400).json({
        success: false,
        message: 'Username atau email sudah digunakan'
      });
    }
  }
  
  // Buat user baru
  const newUser = {
    id: Date.now().toString(),
    fullName,
    username,
    email,
    password, // Dalam production, hash password ini
    phone: phone || '',
    isEmailVerified: false,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Generate verification code
  const verificationCode = generateVerificationCode();
  const codeData = {
    code: verificationCode,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 menit
    isUsed: false
  };
  
  verificationCodes.set(email, codeData);
  
  console.log(`📧 Verification code untuk ${email}: ${verificationCode}`);
  console.log(`📧 Code data stored:`, codeData);
  console.log(`📧 Total codes in memory:`, verificationCodes.size);
  
  res.json({
    success: true,
    message: 'Registrasi berhasil',
    email: email,
    data: {
      code: verificationCode // Hanya untuk development
    }
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('📥 Login request received:', req.body);
  
  const { identifier, password } = req.body;
  
  // Cari user berdasarkan username atau email
  const user = users.find(u => 
    (u.username === identifier || u.email === identifier) && u.password === password
  );
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Username/email atau password salah'
    });
  }
  
  if (!user.isEmailVerified) {
    return res.status(401).json({
      success: false,
      message: 'Email belum diverifikasi',
      needsVerification: true
    });
  }
  
  // Remove password dari response
  const { password: _, ...userResponse } = user;
  
  res.json({
    success: true,
    message: 'Login berhasil',
    user: userResponse
  });
});

// Verify email endpoint
app.post('/api/auth/verify-email', (req, res) => {
  console.log('📥 Verify email request received:', req.body);
  
  const { email, code } = req.body;
  
  console.log(`🔍 Looking for verification code for email: ${email}`);
  console.log(`🔍 Input code: "${code}" (type: ${typeof code})`);
  
  const storedCode = verificationCodes.get(email);
  
  if (!storedCode) {
    console.log(`❌ No stored code found for email: ${email}`);
    console.log(`📋 Available codes:`, Array.from(verificationCodes.keys()));
    return res.status(400).json({
      success: false,
      message: 'Kode verifikasi tidak ditemukan'
    });
  }
  
  console.log(`🔍 Stored code: "${storedCode.code}" (type: ${typeof storedCode.code})`);
  console.log(`🔍 Code comparison: "${code}" === "${storedCode.code}" = ${code === storedCode.code}`);
  console.log(`🔍 Is used: ${storedCode.isUsed}`);
  console.log(`🔍 Expires at: ${storedCode.expiresAt}`);
  console.log(`🔍 Current time: ${new Date()}`);
  
  if (storedCode.isUsed) {
    console.log(`❌ Code already used for email: ${email}`);
    return res.status(400).json({
      success: false,
      message: 'Kode verifikasi sudah digunakan'
    });
  }
  
  if (new Date() > storedCode.expiresAt) {
    console.log(`❌ Code expired for email: ${email}`);
    verificationCodes.delete(email);
    return res.status(400).json({
      success: false,
      message: 'Kode verifikasi sudah expired'
    });
  }
  
  if (storedCode.code !== code) {
    console.log(`❌ Code mismatch for email: ${email}`);
    console.log(`Expected: "${storedCode.code}", Got: "${code}"`);
    return res.status(400).json({
      success: false,
      message: 'Kode verifikasi tidak valid'
    });
  }
  
  // Mark code as used
  storedCode.isUsed = true;
  
  // Update user verification status
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex > -1) {
    users[userIndex].isEmailVerified = true;
  }
  
  res.json({
    success: true,
    message: 'Email berhasil diverifikasi'
  });
});

// Send verification email endpoint
app.post('/api/send-verification-email', (req, res) => {
  console.log('📥 Send verification email request received:', req.body);
  
  const { email } = req.body;
  
  // Generate new verification code
  const verificationCode = generateVerificationCode();
  verificationCodes.set(email, {
    code: verificationCode,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 menit
    isUsed: false
  });
  
  console.log(`📧 New verification code untuk ${email}: ${verificationCode}`);
  
  res.json({
    success: true,
    message: 'Email verifikasi berhasil dikirim',
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
    expiresAt: data.expiresAt,
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
  console.log('🧹 Backend: Semua users dan codes telah dihapus');
  
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
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
      console.log(`🧹 Cleaned up expired code for ${email}`);
    }
  }
}, 5 * 60 * 1000);