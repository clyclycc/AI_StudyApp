import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: '.env.local', override: true })

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.slice(0, 60) + '...')
    const r = await prisma.$queryRaw`SELECT 1 as result`
    console.log('query OK:', r)
  } catch (e) {
    console.error('db error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
