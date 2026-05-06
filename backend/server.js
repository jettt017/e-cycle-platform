import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma with PostgreSQL adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow local dev + production frontend URL + Vercel preview URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any *.vercel.app subdomain (covers preview deployments)
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Increase JSON body limit for base64 image uploads (up to ~10MB image = ~14MB base64)
app.use(express.json({ limit: '20mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to E-Cycle API', version: '1.0.0' });
});

// Auto-Seed Data: Jika database masih kosong, kita isi otomatis
async function seedDropPoints() {
  try {
    const count = await prisma.dropPoint.count();
    if (count === 0) {
      console.log("Database kosong. Menyisipkan data awal Drop Points...");
      await prisma.dropPoint.createMany({
        data: [
          { name: 'Eco Recycle Center', address: 'Jl. Sudirman No. 123', latitude: -6.200000, longitude: 106.816666, operatingHours: '08:00 - 17:00' },
          { name: 'Tech Waste Drop', address: 'Jl. Thamrin No. 45', latitude: -6.190000, longitude: 106.820000, operatingHours: '09:00 - 18:00' },
          { name: 'E-Waste Bank Jaksel', address: 'Jl. Kemang Raya No. 10', latitude: -6.260000, longitude: 106.810000, operatingHours: '07:00 - 15:00' }
        ]
      });
      console.log("Data awal berhasil disisipkan!");
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
}
seedDropPoints();

// Endpoint untuk mengambil daftar Drop Points dari Database
app.get('/api/droppoints', async (req, res) => {
  try {
    const dropPoints = await prisma.dropPoint.findMany();
    res.json(dropPoints);
  } catch (error) {
    console.error('Gagal mengambil data dari database', error);
    res.status(500).json({ error: 'Gagal mengambil data dari database' });
  }
});

// Mock Route for E-Waste Estimator (Biarkan aja dulu, nanti kita upgrade di fase selanjutnya)
app.post('/api/estimate', (req, res) => {
  const { deviceType, brand, condition } = req.body;
  let baseValue = 0;
  if (deviceType === 'smartphone') baseValue = 50000;
  else if (deviceType === 'laptop') baseValue = 150000;
  
  if (condition === 'working') baseValue *= 1.5;
  else if (condition === 'broken') baseValue *= 0.5;

  res.json({ estimatedValue: baseValue, currency: 'IDR' });
});

// Endpoint untuk menerima data form penjemputan
app.post('/api/pickups', async (req, res) => {
  try {
    const { name, phone, address, city, postalCode, date, time, deviceTypes, deviceCount, kondisi, notes, priority } = req.body;
    
    // Buat ID unik untuk user anonim & submission
    const userId = crypto.randomUUID();
    const submissionId = crypto.randomUUID();
    const submissionCode = `SUB-${Date.now()}`;
    
    // Parse waktu dari "09:00 - 11:00" atau sejenisnya, menggunakan regex untuk menangkap dash / en-dash
    const [startStr, endStr] = time ? time.split(/\s*[-–]\s*/) : ['08:00', '10:00'];
    const startTime = new Date(`1970-01-01T${startStr.padStart(5, '0')}:00Z`);
    const endTime = new Date(`1970-01-01T${endStr.padStart(5, '0')}:00Z`);

    // 1. Simpan ke tabel submissions (karena pickups butuh submission_id)
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

    // 2. Simpan ke tabel pickups
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
        courier_name: name, // Simpan nama pengirim sementara di sini jika tidak ada field khusus
        courier_phone: phone, // Simpan telepon pengirim sementara di sini
      }
    });

    res.status(201).json({ success: true, message: 'Pickup scheduled successfully!', data: newPickup });
  } catch (error) {
    console.error("Gagal menyimpan data pickup:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ── AI Analyze — Google Gemini 2.0 Flash (free) ───────────────────────────────
app.post('/api/ai/analyze', async (req, res) => {
  const { imageBase64, mediaType } = req.body;

  console.log('[AI] Request received, mediaType:', mediaType, '| imageBase64 length:', imageBase64?.length);

  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[AI] GEMINI_API_KEY not set!');
    return res.status(503).json({ error: 'AI service not configured. Set GEMINI_API_KEY.' });
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const safeType = validTypes.includes(mediaType) ? mediaType : 'image/jpeg';
  console.log('[AI] Using mediaType:', safeType);

  const prompt = `You are an e-waste detection system. Analyze this image and return ONLY valid JSON (no markdown, no backticks, no explanation):
{"deviceTypes":["<one of: Smartphone, Laptop, Tablet, TV / Monitor, Printer, Kabel / Aksesori, Lainnya>"],"kondisi":["<one or more of: Menyala normal, Mati total, Layar retak, Baterai bocor, Fisik rusak, Kondisi baik>"],"estimasiKondisi":"<1 sentence in Bahasa Indonesia>","confidence":"<tinggi/sedang/rendah>"}
Use only values from the lists. If not electronics, use Lainnya.`;

  try {

    // Try primary model first, fall back to lite on 429/404
    const MODELS = [
      'gemini-flash-latest',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
    ];

    let geminiRes;
    for (let mi = 0; mi < MODELS.length; mi++) {
      const model = MODELS[mi];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`[AI] Trying model: ${model}`);

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
        console.log(`[AI] ${model} attempt ${attempt} — status:`, geminiRes.status);
        if (geminiRes.status !== 429) break;
        await new Promise(r => setTimeout(r, attempt * 3000));
      }

      // Move to next model only on 429 or 404
      if (geminiRes.status !== 429 && geminiRes.status !== 404) break;
      console.log(`[AI] Model ${model} unavailable (${geminiRes.status}), trying next...`);
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[AI] Gemini error body:', errText);
      return res.status(502).json({ error: 'AI service error', status: geminiRes.status, detail: errText });
    }

    const data = await geminiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[AI] Raw text from Gemini:', rawText);

    // 1. Strip markdown fences
    let clean = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // 2. If still not valid JSON, try to extract first { } block
    if (!clean.startsWith('{')) {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) clean = match[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(clean);
      console.log('[AI] Parsed result:', JSON.stringify(parsed));
    } catch (parseErr) {
      console.error('[AI] JSON parse failed. Raw:', rawText);
      return res.status(502).json({ error: 'AI returned unexpected format', raw: rawText.substring(0, 200) });
    }

    res.json(parsed);
  } catch (err) {
    console.error('[AI] Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to connect to AI service', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});