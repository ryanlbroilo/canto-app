import { PrismaClient, Role } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

// Seed idempotente: um tenant "demo" com um usuário OWNER para desenvolvimento.
async function main(): Promise<void> {
  const slug = 'demo'
  const tenant = await prisma.tenant.upsert({
    where: { slug },
    update: {},
    create: { name: 'Estúdio Demo', slug },
  })

  const email = 'demo@canto.app'
  const passwordHash = await argon2.hash('canto1234')
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email } },
    update: {},
    create: { tenantId: tenant.id, email, passwordHash, name: 'Demo', role: Role.OWNER },
  })

  // eslint-disable-next-line no-console
  console.log('Seed OK → tenant "demo" · login: demo@canto.app / canto1234')
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
