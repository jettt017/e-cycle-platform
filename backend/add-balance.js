import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.updateMany({ data: { totalPoints: 5000000 } });
  console.log('Added 5000000 points to all users for testing.');
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
