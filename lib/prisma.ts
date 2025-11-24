import { PrismaClient } from '@prisma/client'

declare global {
  // allow global prisma during development to avoid multiple instances in HMR
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma = (globalThis as any).__prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') (globalThis as any).__prisma = prisma

export default prisma
