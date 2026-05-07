import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// ── Prisma Client Setup ────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));

// ── Password Utilities (PBKDF2 via built-in crypto) ───────────────────────────
const HASH_ITERATIONS = 100000;
const HASH_KEYLEN = 64;
const HASH_ALGO = 'sha512';

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_ALGO)
    .toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(':');
    const testHash = crypto
      .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_ALGO)
      .toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

// ── JWT Utilities ─────────────────────────────────────────────────────────────
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// ── Auth Middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Token tidak ditemukan' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token kadaluarsa, silakan login ulang' });
    }
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to E-Cycle API', version: '2.0.0' });
});

// ── AUTO SEED Drop Points ─────────────────────────────────────────────────────
async function seedDropPoints() {
  try {
    const count = await prisma.dropPoint.count();
    if (count === 0) {
      console.log('Database kosong. Menyisipkan data awal Drop Points...');
      await prisma.dropPoint.createMany({
        data: [
          { name: 'Eco Recycle Center', address: 'Jl. Sudirman No. 123', latitude: -6.200000, longitude: 106.816666, operatingHours: '08:00 - 17:00' },
          { name: 'Tech Waste Drop', address: 'Jl. Thamrin No. 45', latitude: -6.190000, longitude: 106.820000, operatingHours: '09:00 - 18:00' },
          { name: 'E-Waste Bank Jaksel', address: 'Jl. Kemang Raya No. 10', latitude: -6.260000, longitude: 106.810000, operatingHours: '07:00 - 15:00' },
        ]
      });
      console.log('Data awal berhasil disisipkan!');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}
seedDropPoints();

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid' });
  }

  try {
    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email sudah terdaftar. Silakan login.' });
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'user',
        totalPoints: 0,
      },
      select: { id: true, name: true, email: true, totalPoints: true, createdAt: true }
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    console.log(`[AUTH] User registered: ${user.email} (id=${user.id})`);
    return res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat!',
      token,
      user,
    });
  } catch (err) {
    console.error('[AUTH] Register error:', err.message);
    return res.status(500).json({ error: 'Gagal membuat akun. Coba lagi.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, passwordHash: true, role: true, totalPoints: true, createdAt: true }
    });

    if (!user) {
      // Generic message to avoid user enumeration
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const { passwordHash: _ph, ...safeUser } = user;

    console.log(`[AUTH] User logged in: ${user.email} (id=${user.id})`);
    return res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    return res.status(500).json({ error: 'Gagal login. Coba lagi.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER ENDPOINTS (Protected)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/users/me — get current user profile
app.get('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, totalPoints: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    return res.json({ success: true, user });
  } catch (err) {
    console.error('[USER] /me error:', err.message);
    return res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

// GET /api/users/me/balance — get saldo (1 point = Rp 1)
app.get('/api/users/me/balance', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { totalPoints: true }
    });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    // 1 point = Rp 1
    const balance = user.totalPoints;
    console.log(`[BALANCE] userId=${req.user.userId} balance=${balance}`);
    return res.json({ success: true, balance, currency: 'IDR' });
  } catch (err) {
    console.error('[BALANCE] Error:', err.message);
    return res.status(500).json({ error: 'Gagal mengambil saldo' });
  }
});

// GET /api/users/me/transactions — get user transactions
app.get('/api/users/me/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        status: true,
        totalPointsEarned: true,
        createdAt: true,
        dropPoint: { select: { name: true } },
      }
    });

    const formatted = transactions.map(t => ({
      id: t.id,
      tanggal: t.createdAt,
      jumlah: t.totalPointsEarned, // 1 point = Rp 1
      status: t.status,            // pending | verified | completed
      lokasi: t.dropPoint?.name || 'E-Cycle',
    }));

    return res.json({ success: true, transactions: formatted });
  } catch (err) {
    console.error('[TRANSACTIONS] Error:', err.message);
    return res.status(500).json({ error: 'Gagal mengambil transaksi' });
  }
});

// POST /api/users/me/withdraw — process withdrawal
app.post('/api/users/me/withdraw', authMiddleware, async (req, res) => {
  const { amount, method, nomor } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Jumlah penarikan tidak valid' });
  if (!method || !nomor) return res.status(400).json({ error: 'Metode dan nomor telepon wajib diisi' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    if (user.totalPoints < amount) return res.status(400).json({ error: 'Saldo tidak cukup' });

    const firstDropPoint = await prisma.dropPoint.findFirst();
    
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { totalPoints: { decrement: amount } }
      });
      
      if (firstDropPoint) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            dropPointId: firstDropPoint.id,
            status: 'completed',
            totalPointsEarned: -amount
          }
        });
      }
    });

    return res.json({ success: true, message: 'Penarikan berhasil diproses' });
  } catch (err) {
    console.error('[WITHDRAW] Error:', err.message);
    return res.status(500).json({ error: 'Gagal memproses penarikan' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXISTING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/droppoints
app.get('/api/droppoints', async (req, res) => {
  try {
    const dropPoints = await prisma.dropPoint.findMany();
    res.json(dropPoints);
  } catch (error) {
    console.error('Gagal mengambil data dari database', error);
    res.status(500).json({ error: 'Gagal mengambil data dari database' });
  }
});

// POST /api/estimate (mock estimator — upgrade nanti)
app.post('/api/estimate', (req, res) => {
  const { deviceType, condition } = req.body;
  let baseValue = 0;
  if (deviceType === 'smartphone') baseValue = 50000;
  else if (deviceType === 'laptop') baseValue = 150000;
  if (condition === 'working') baseValue *= 1.5;
  else if (condition === 'broken') baseValue *= 0.5;
  res.json({ estimatedValue: baseValue, currency: 'IDR' });
});

// POST /api/pickups
app.post('/api/pickups', async (req, res) => {
  try {
    const { name, phone, address, city, postalCode, date, time, deviceTypes, deviceCount, kondisi, notes, priority } = req.body;

    const userId = crypto.randomUUID();
    const submissionId = crypto.randomUUID();
    const submissionCode = `SUB-${Date.now()}`;

    const [startStr, endStr] = time ? time.split(/\s*[-–]\s*/) : ['08:00', '10:00'];
    const startTime = new Date(`1970-01-01T${startStr.padStart(5, '0')}:00Z`);
    const endTime = new Date(`1970-01-01T${endStr.padStart(5, '0')}:00Z`);

    await prisma.submissions.create({
      data: {
        id: submissionId,
        submission_code: submissionCode,
        user_id: userId,
        method: 'pickup',
        devices_detail: { deviceTypes, deviceCount, kondisi },
        user_notes: notes,
      }
    });

    const newPickup = await prisma.pickups.create({
      data: {
        submission_id: submissionId,
        user_id: userId,
        scheduled_date: new Date(date),
        scheduled_time_start: startTime,
        scheduled_time_end: endTime,
        pickup_address: address,
        pickup_city: city,
        notes: priority ? `Priority: ${priority} | ${notes}` : notes,
        courier_name: name,
        courier_phone: phone,
      }
    });

    res.status(201).json({ success: true, message: 'Pickup scheduled successfully!', data: newPickup });
  } catch (error) {
    console.error('Gagal menyimpan data pickup:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error', detail: error.message });
  }
});

// ── AI Analyze — Google Gemini ────────────────────────────────────────────────
app.post('/api/ai/analyze', async (req, res) => {
  const { imageBase64, mediaType } = req.body;

  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured. Set GEMINI_API_KEY.' });
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const safeType = validTypes.includes(mediaType) ? mediaType : 'image/jpeg';

  const prompt = `You are an e-waste detection system. Analyze this image and return ONLY valid JSON (no markdown, no backticks, no explanation):\n{"deviceTypes":["<one of: Smartphone, Laptop, Tablet, TV / Monitor, Printer, Kabel / Aksesori, Lainnya>"],"kondisi":["<one or more of: Menyala normal, Mati total, Layar retak, Baterai bocor, Fisik rusak, Kondisi baik>"],"estimasiKondisi":"<1 sentence in Bahasa Indonesia>","confidence":"<tinggi/sedang/rendah>"}\nUse only values from the lists. If not electronics, use Lainnya.`;

  try {
    const MODELS = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    let geminiRes;

    for (let mi = 0; mi < MODELS.length; mi++) {
      const model = MODELS[mi];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      for (let attempt = 1; attempt <= 2; attempt++) {
        geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [
              { inline_data: { mime_type: safeType, data: imageBase64 } },
              { text: prompt }
            ]}],
            generationConfig: { maxOutputTokens: 512, temperature: 0.1 }
          })
        });
        if (geminiRes.status !== 429) break;
        await new Promise(r => setTimeout(r, attempt * 3000));
      }
      if (geminiRes.status !== 429 && geminiRes.status !== 404) break;
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({ error: 'AI service error', status: geminiRes.status, detail: errText });
    }

    const data = await geminiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let clean = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) clean = jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        deviceTypes: ['Lainnya'],
        kondisi: ['Kondisi baik'],
        estimasiKondisi: 'AI tidak dapat mendeteksi perangkat dengan jelas.',
        confidence: 'rendah'
      };
    }

    res.json(parsed);
  } catch (err) {
    console.error('[AI] Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to connect to AI service', detail: err.message });
  }
});

// ── Server Start ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`   Auth: POST /api/auth/register | POST /api/auth/login`);
    console.log(`   User: GET /api/users/me | /balance | /transactions`);
  });
}

export default app;
