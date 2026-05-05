import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; 
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

console.log("ALARM DEBUG - DATABASE_URL:", process.env.DATABASE_URL ? "TERBACA MANTAP" : "KOSONG!");

// 2. Inisialisasi senjata utama kita (Prisma)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-Cycle API' });
});

// Mock Data kita jadikan komentar aja buat kenang-kenangan / referensi bentuk data
/*
const dropPoints = [
  { id: 1, name: 'Eco Recycle Center', address: 'Jl. Sudirman No. 123', lat: -6.200000, lng: 106.816666, accepted: ['Phones', 'Laptops', 'Batteries'] },
  { id: 2, name: 'Tech Waste Drop', address: 'Jl. Thamrin No. 45', lat: -6.190000, lng: 106.820000, accepted: ['Monitors', 'Printers'] },
];
*/

// 3. UPGRADE API INI! Sekarang narik data ASLI dari Supabase
// Route narik data
app.get('/api/droppoints', async (req, res) => {
  try {
    const realDropPoints = await prisma.ecycle_drop_points.findMany();
    res.json(realDropPoints);
  } catch (error) {
    console.error("Gagal narik data Supabase:", error);
    res.status(500).json({ error: "Internal Server Error" });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});