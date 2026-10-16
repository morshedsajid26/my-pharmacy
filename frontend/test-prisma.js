const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function t() {
  try {
    await prisma.$transaction(async (tx) => {
      const p = await tx.purchase.create({
        data: {
          invoiceNo: 'PUR-TEST-' + Date.now(),
          supplier: 'Test',
          totalAmount: 150,
          items: {
            create: [{
              medicine: {
                create: {
                  name: 'Test Med',
                  company: 'Test',
                  category: 'Suspension (Susp)',
                  purchasePrice: 10,
                  sellingPrice: 20
                }
              },
              quantity: 10,
              unitPrice: 15,
              totalPrice: 150
            }]
          }
        }
      });
      console.log('OK', p.id);
      throw new Error('ROLLBACK');
    });
  } catch(e) {
    console.log('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
t();
