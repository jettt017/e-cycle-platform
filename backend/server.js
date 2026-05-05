import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});