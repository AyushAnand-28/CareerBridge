import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function go() {
  const jobs = await prisma.jobPosting.findMany({ select: { id: true, title: true, techStack: true } });
  console.log(JSON.stringify(jobs, null, 2));
}
go().catch(console.error).finally(() => prisma.$disconnect());
