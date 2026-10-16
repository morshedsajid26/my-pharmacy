import prisma from '../../../config/db.js';

export const getPurchasesService = async () => {
  return await prisma.purchase.findMany({
    include: {
      items: { include: { medicine: true } },
    },
    orderBy: { date: 'desc' },
  });
};

export const recordPurchaseService = async ({ company, items, totalAmount }) => {
  return await prisma.$transaction(async (tx) => {
    const invoiceNo = `PUR-${Date.now()}`;
    const processedItems = [];

    for (const item of items) {
      let medicineId = item.medicineId;

      if (!medicineId && item.name) {
        const newMedicine = await tx.medicine.create({
          data: {
            name: item.name,
            genericName: item.genericName || '',
            company: item.company || company,
            category: item.category || 'Tablet',
            purchasePrice: parseFloat(item.unitPrice),
            sellingPrice: parseFloat(item.sellingPrice) || 0,
            status: 'In Stock',
            stock: 0,
          },
        });
        medicineId = newMedicine.id;
      }

      processedItems.push({
        medicineId,
        quantity: parseInt(item.quantity, 10),
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseInt(item.quantity, 10) * parseFloat(item.unitPrice),
      });

      if (medicineId) {
        await tx.medicine.update({
          where: { id: medicineId },
          data: {
            stock: { increment: parseInt(item.quantity, 10) },
            purchasePrice: parseFloat(item.unitPrice),
            ...(parseFloat(item.sellingPrice) > 0 ? { sellingPrice: parseFloat(item.sellingPrice) } : {}),
          },
        });
      }
    }

    return await tx.purchase.create({
      data: {
        invoiceNo,
        supplier: company,
        totalAmount: parseFloat(totalAmount),
        items: {
          create: processedItems,
        },
      },
      include: {
        items: { include: { medicine: true } },
      },
    });
  });
};

export const updatePurchaseService = async (id, { company, items, totalAmount }) => {
  return await prisma.$transaction(async (tx) => {
    const oldPurchase = await tx.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!oldPurchase) throw new Error('Purchase record not found');

    for (const oldItem of oldPurchase.items) {
      if (oldItem.medicineId) {
        await tx.medicine.update({
          where: { id: oldItem.medicineId },
          data: { stock: { decrement: oldItem.quantity } },
        });
      }
    }

    await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });

    const processedItems = [];
    for (const item of items) {
      let medicineId = item.medicineId;
      if (!medicineId && item.name) {
        const newMedicine = await tx.medicine.create({
          data: {
            name: item.name,
            genericName: item.genericName || '',
            company: item.company || company,
            category: item.category || 'Tablet',
            purchasePrice: parseFloat(item.unitPrice),
            sellingPrice: parseFloat(item.sellingPrice) || 0,
            status: 'In Stock',
            stock: 0,
          },
        });
        medicineId = newMedicine.id;
      }

      processedItems.push({
        medicineId,
        quantity: parseInt(item.quantity, 10),
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseInt(item.quantity, 10) * parseFloat(item.unitPrice),
      });

      if (medicineId) {
        await tx.medicine.update({
          where: { id: medicineId },
          data: {
            stock: { increment: parseInt(item.quantity, 10) },
            purchasePrice: parseFloat(item.unitPrice),
            ...(parseFloat(item.sellingPrice) > 0 ? { sellingPrice: parseFloat(item.sellingPrice) } : {}),
          },
        });
      }
    }

    return await tx.purchase.update({
      where: { id },
      data: {
        supplier: company,
        totalAmount: parseFloat(totalAmount),
        items: { create: processedItems },
      },
      include: { items: { include: { medicine: true } } },
    });
  });
};

export const deletePurchaseService = async (id) => {
  return await prisma.$transaction(async (tx) => {
    const oldPurchase = await tx.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!oldPurchase) throw new Error('Purchase record not found');

    for (const item of oldPurchase.items) {
      if (item.medicineId) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
    await tx.purchase.delete({ where: { id } });
  });
};
