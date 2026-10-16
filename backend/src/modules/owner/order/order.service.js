import prisma from '../../../config/db.js';

export const getAllOrdersAdminService = async (status) => {
  const where = {};
  if (status && status !== 'ALL') where.status = status;

  return await prisma.onlineOrder.findMany({
    where,
    include: {
      customer: true,
      items: { include: { medicine: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPendingOrdersCountService = async () => {
  return await prisma.onlineOrder.count({ where: { status: 'PENDING' } });
};

export const approveOnlineOrderService = async (orderId) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.onlineOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');
    if (order.status !== 'PENDING') {
      throw new Error(`Order cannot be approved because current status is ${order.status}`);
    }

    let totalProfit = 0;
    const saleItems = [];

    for (const item of order.items) {
      const medicine = await tx.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) throw new Error('Medicine not found in inventory');
      if (medicine.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${medicine.name}. Only ${medicine.stock} left in stock.`);
      }

      const profit = (medicine.sellingPrice - medicine.purchasePrice) * item.quantity;
      totalProfit += profit;

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
        totalPrice: item.totalPrice,
      });
    }

    let dbCustomer = await tx.customer.findUnique({
      where: { phone: order.customerPhone },
    });

    if (!dbCustomer) {
      dbCustomer = await tx.customer.create({
        data: {
          name: order.customerName,
          phone: order.customerPhone,
          dueAmount: 0,
          totalSpent: order.totalAmount,
          status: 'Regular',
        },
      });
    } else {
      await tx.customer.update({
        where: { id: dbCustomer.id },
        data: { totalSpent: { increment: order.totalAmount } },
      });
    }

    const invoiceNo = `INV-${Date.now()}`;
    await tx.sale.create({
      data: {
        invoiceNo,
        totalAmount: order.totalAmount,
        paidAmount: order.totalAmount,
        dueAmount: 0,
        profit: totalProfit,
        itemsCount: order.items.length,
        customerId: dbCustomer.id,
        isOnline: true,
        items: { create: saleItems },
      },
    });

    const updatedOrder = await tx.onlineOrder.update({
      where: { id: orderId },
      data: { status: 'APPROVED' },
    });

    return { invoiceNo, orderNo: updatedOrder.orderNo };
  });
};

export const rejectOnlineOrderService = async (orderId) => {
  const order = await prisma.onlineOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');
  if (order.status !== 'PENDING') {
    throw new Error(`Cannot reject order in status ${order.status}`);
  }

  return await prisma.onlineOrder.update({
    where: { id: orderId },
    data: { status: 'REJECTED' },
  });
};
