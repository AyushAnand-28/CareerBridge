import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function go() {
  const users = await prisma.user.findMany({
    where: { role: 'CANDIDATE' },
    select: { email: true, resumeUrl: true }
  });
  console.log(JSON.stringify(users, null, 2));
}
go().catch(console.error).finally(() => prisma.$disconnect());
