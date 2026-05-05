import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

console.log("STARTUP: DATABASE_URL status:", process.env.DATABASE_URL ? "✓ Configured" : "✗ MISSING!");

let prisma;

try {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter, log: ['warn', 'error'] });
  console.log("✓ Prisma client initialized");
} catch (err) {
  console.error("✗ Prisma init failed:", err.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to E-Cycle API',
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL ? 'vercel' : 'local'
  });
});

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', db: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Auto-Seed Data: Jika database masih kosong, kita isi otomatis
async function seedDropPoints() {
  try {
    const count = await prisma.dropPoint.count();
    if (count === 0) {
      console.log("Seeding drop points...");
      await prisma.dropPoint.createMany({
        data: [
          { name: 'Eco Recycle Center', address: 'Jl. Sudirman No. 123', latitude: -6.200000, longitude: 106.816666, operatingHours: '08:00 - 17:00' },
          { name: 'Tech Waste Drop', address: 'Jl. Thamrin No. 45', latitude: -6.190000, longitude: 106.820000, operatingHours: '09:00 - 18:00' },
          { name: 'E-Waste Bank Jaksel', address: 'Jl. Kemang Raya No. 10', latitude: -6.260000, longitude: 106.810000, operatingHours: '07:00 - 15:00' }
        ]
      });
      console.log("✓ Seed completed");
    }
  } catch (err) {
    console.error('✗ Seed error:', err.message);
  }
}

// Run seed on startup (non-blocking)
seedDropPoints().catch(err => console.error('Fatal seed error:', err));

// Endpoint untuk mengambil daftar Drop Points dari Database
app.get('/api/droppoints', async (req, res) => {
  try {
    if (!prisma) {
      throw new Error('Database not initialized');
    }
    const dropPoints = await prisma.dropPoint.findMany();
    res.json(dropPoints);
  } catch (error) {
    console.error('✗ /api/droppoints error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drop points',
      message: error.message,
      env: process.env.DATABASE_URL ? 'DB_SET' : 'DB_MISSING'
    });
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

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;