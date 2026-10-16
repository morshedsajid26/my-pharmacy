import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Default Admin User
  const adminEmail = 'admin@pharmacy.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        name: 'Pharmacy Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('✅ Created default Admin account: admin@pharmacy.com / admin123');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // 2. Create Default Storefront Settings
  const settings = await prisma.storefrontSetting.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      minOrderForFreeDelivery: 500,
      deliveryCharge: 20,
    },
  });
  console.log('✅ Storefront settings ready');

  // 3. Create Default Discount Tiers
  const existingTiers = await prisma.discountTier.findMany({ where: { settingId: 'settings' } });
  if (existingTiers.length === 0) {
    await prisma.discountTier.createMany({
      data: [
        { settingId: 'settings', threshold: 1000, percent: 5 },
        { settingId: 'settings', threshold: 2000, percent: 10 },
      ],
    });
    console.log('✅ Default discount tiers seeded (5% on ৳1000, 10% on ৳2000)');
  }

  // 4. Seed Medicines
  const medicinesFilePath = path.join(__dirname, 'medicines_bd.json');
  if (fs.existsSync(medicinesFilePath)) {
    const rawData = fs.readFileSync(medicinesFilePath, 'utf8');
    const medicinesData = JSON.parse(rawData);

    console.log(`📦 Seeding ${medicinesData.length} medicines...`);

    for (const med of medicinesData) {
      const expiryDate = med.expiryDate ? new Date(med.expiryDate) : null;

      await prisma.medicine.upsert({
        where: { id: String(med.id) },
        update: {
          name: med.name,
          genericName: med.genericName || null,
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
          genericName: med.genericName || null,
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
    console.log('✅ All medicines seeded successfully!');
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
