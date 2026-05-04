import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const { Pool } = pg;
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
}
seedDropPoints();

// Endpoint untuk mengambil daftar Drop Points dari Database
app.get('/api/droppoints', async (req, res) => {
  try {
    const dropPoints = await prisma.dropPoint.findMany();
    res.json(dropPoints);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data dari database" });
  }
});

// Mock Route for E-Waste Estimator
app.post('/api/estimate', (req, res) => {
  const { deviceType, brand, condition } = req.body;
  // Simple mock logic
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
