import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-Cycle API' });
});

// Mock Data for Drop Points
const dropPoints = [
  { id: 1, name: 'Eco Recycle Center', address: 'Jl. Sudirman No. 123', lat: -6.200000, lng: 106.816666, accepted: ['Phones', 'Laptops', 'Batteries'] },
  { id: 2, name: 'Tech Waste Drop', address: 'Jl. Thamrin No. 45', lat: -6.190000, lng: 106.820000, accepted: ['Monitors', 'Printers'] },
];

app.get('/api/droppoints', (req, res) => {
  res.json(dropPoints);
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
