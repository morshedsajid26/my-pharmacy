import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Storefront Settings
  const settings = await prisma.storefrontSetting.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      minOrderForFreeDelivery: 500,
      deliveryCharge: 20,
    },
  });
  console.log('Upserted storefront settings:', settings);

  // 2. Load and Seed Medicines
  const medicinesFilePath = path.join(process.cwd(), 'src', 'mockData', 'medicines_bd.json');
  if (fs.existsSync(medicinesFilePath)) {
    const rawData = fs.readFileSync(medicinesFilePath, 'utf8');
    const medicinesData = JSON.parse(rawData);

    console.log(`Found ${medicinesData.length} medicines to seed.`);

    for (const med of medicinesData) {
      // Parse expiryDate
      const expiryDate = med.expiryDate ? new Date(med.expiryDate) : null;

      await prisma.medicine.upsert({
        where: { id: String(med.id) },
        update: {
          name: med.name,
          company: med.company,
          category: med.category,
          purchasePrice: parseFloat(med.purchasePrice),
          sellingPrice: parseFloat(med.sellingPrice),
          stock: parseInt(med.stock),
          expiryDate: expiryDate,
          status: med.status,
        },
        create: {
          id: String(med.id),
          name: med.name,
          company: med.company,
          category: med.category,
          purchasePrice: parseFloat(med.purchasePrice),
          sellingPrice: parseFloat(med.sellingPrice),
          stock: parseInt(med.stock),
          expiryDate: expiryDate,
          status: med.status,
        },
      });
    }
    console.log('Medicines successfully seeded.');
  } else {
    console.warn(`Medicines mock file not found at ${medicinesFilePath}`);
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
