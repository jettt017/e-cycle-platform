import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testSubmission() {
  try {
    const submissionId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const submissionCode = `SUB-${Date.now()}`;
    
    console.log("Attempting to insert submission...");
    const result = await prisma.submissions.create({
      data: {
        id: submissionId,
        submission_code: submissionCode,
        user_id: userId,
        method: 'pickup',
        devices_detail: { deviceTypes: ['Smartphone'], deviceCount: '1-3', kondisi: ['Layar retak'] },
        user_notes: "Test notes",
      }
    });
    console.log("Success:", result);
  } catch (error) {
    console.error("Error Details:", error);
  } finally {
    await prisma.$disconnect();
  }
}
testSubmission();
