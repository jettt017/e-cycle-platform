import 'dotenv/config';
import express from 'express';
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});