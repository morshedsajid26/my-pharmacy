import prisma from '../../../config/db.js';

export const getSalesHistoryService = async () => {
  return await prisma.sale.findMany({
    include: {
      customer: true,
      items: { include: { medicine: true } },
    },
    orderBy: { date: 'desc' },
  });
};

export const recordSaleService = async ({ items, totalAmount, customerId, paidAmount = 0, dueAmount = 0, walkingCustomerName }) => {
  return await prisma.$transaction(async (tx) => {
    const invoiceNo = `INV-${Date.now()}`;
    let totalProfit = 0;
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const medicine = await tx.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine || medicine.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${medicine?.name || 'medicine'}`);
      }

      const profit = (medicine.sellingPrice - medicine.purchasePrice) * item.quantity;
      totalProfit += profit;
      subtotal += medicine.sellingPrice * item.quantity;

      const newStock = medicine.stock - item.quantity;
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: {
          stock: newStock,
          status: newStock === 0 ? 'Out of Stock' : newStock <= 10 ? 'Low' : 'In Stock',
        },
      });

      saleItems.push({
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: medicine.sellingPrice,
        totalPrice: medicine.sellingPrice * item.quantity,
      });
    }

    const discountAndRoundOff = Math.max(0, subtotal - parseFloat(totalAmount));
    const finalProfit = totalProfit - discountAndRoundOff;

    if (customerId) {
      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalSpent: { increment: parseFloat(totalAmount) },
          dueAmount: { increment: parseFloat(dueAmount) || 0 },
        },
      });
    }

    return await tx.sale.create({
      data: {
        invoiceNo,
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount) || 0,
        dueAmount: parseFloat(dueAmount) || 0,
        profit: finalProfit,
        itemsCount: items.length,
        customerId: customerId || null,
        walkingCustomerName: walkingCustomerName || null,
        items: {
          create: saleItems,
        },
      },
      include: {
        items: { include: { medicine: true } },
        customer: true,
      },
    });
  });
};
