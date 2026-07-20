const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.reportHistory.findMany({ orderBy: { generatedAt: 'desc' }, take: 5 });
  for (const r of rows) {
    console.log(JSON.stringify({ id: r.id.substring(0,8), status: r.status, size: r.fileSizeBytes, fileUrl: r.fileUrl }));
  }
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
