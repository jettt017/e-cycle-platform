import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTables() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ecycle_users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      total_points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ecycle_drop_points (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      operating_hours TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ecycle_waste_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      points_per_kg INTEGER NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS ecycle_transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES ecycle_users(id),
      drop_point_id INTEGER REFERENCES ecycle_drop_points(id),
      status TEXT DEFAULT 'pending',
      total_points_earned INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ecycle_transaction_items (
      id SERIAL PRIMARY KEY,
      transaction_id INTEGER REFERENCES ecycle_transactions(id),
      waste_category_id INTEGER REFERENCES ecycle_waste_categories(id),
      weight_kg DOUBLE PRECISION NOT NULL,
      points_earned INTEGER NOT NULL
    );
  `;

  try {
    console.log("Creating tables...");
    await pool.query(sql);
    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    await pool.end();
  }
}

createTables();
