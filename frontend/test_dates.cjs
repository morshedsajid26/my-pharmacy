const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({ select: { date: true } });
  console.log(sales);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
