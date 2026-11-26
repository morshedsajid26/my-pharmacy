import prisma from '../../../config/db.js';

const deductOrderStock = async (tx, order) => {
  for (const item of order.items) {
    const medicine = await tx.medicine.findUnique({
      where: { id: item.medicineId },
    });

    if (!medicine) throw new Error('Medicine not found in inventory');
    if (medicine.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${medicine.name}. Only ${medicine.stock} left in stock.`);
    }

    const newStock = medicine.stock - item.quantity;
    await tx.medicine.update({
      where: { id: item.medicineId },
      data: {
        stock: newStock,
        status: newStock === 0 ? 'Out of Stock' : newStock <= 10 ? 'Low' : 'In Stock',
      },
    });
  }
};

const restoreOrderStock = async (tx, order) => {
  for (const item of order.items) {
    const medicine = await tx.medicine.findUnique({
      where: { id: item.medicineId },
    });
    if (!medicine) continue;

    const newStock = medicine.stock + item.quantity;
    await tx.medicine.update({
      where: { id: item.medicineId },
      data: {
        stock: newStock,
        status: newStock === 0 ? 'Out of Stock' : newStock <= 10 ? 'Low' : 'In Stock',
      },
    });
  }
};

const recordDeliveredSale = async (tx, order, currentUser = null) => {
  let totalProfit = 0;
  const saleItems = [];

  for (const item of order.items) {
    const medicine = await tx.medicine.findUnique({
      where: { id: item.medicineId },
    });

    const purchasePrice = medicine ? Number(medicine.purchasePrice) || 0 : 0;
    const effectiveUnitPrice =
      item.unitPrice !== undefined ? Number(item.unitPrice) : Number(medicine?.sellingPrice || 0);
    const profit = (effectiveUnitPrice - purchasePrice) * item.quantity;
    totalProfit += profit;

    saleItems.push({
      medicineId: item.medicineId,
      quantity: item.quantity,
      unitPrice: effectiveUnitPrice,
      totalPrice: item.totalPrice,
    });
  }

  let dbCustomer = null;
  if (order.customerId) {
    dbCustomer = await tx.customer.findUnique({
      where: { id: order.customerId },
    });
  }
  if (!dbCustomer && order.customerPhone) {
    dbCustomer = await tx.customer.findUnique({
      where: { phone: order.customerPhone },
    });
  }

  if (!dbCustomer) {
    dbCustomer = await tx.customer.create({
      data: {
        name: order.customerName || 'Online Customer',
        phone: order.customerPhone || `CUST-${Date.now()}`,
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

  const invoiceNo = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const attributedStaffId =
    order.assignedStaffId ||
    (String(currentUser?.role || '').toLowerCase() === 'staff' ? currentUser.id : null);

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
      staffId: attributedStaffId,
      items: { create: saleItems },
    },
  });

  return invoiceNo;
};

export const getAllOrdersAdminService = async (status) => {
  const where = {};
  if (status && status !== 'ALL') {
    if (status === 'ACCEPTED') {
      where.status = { in: ['ACCEPTED', 'APPROVED'] };
    } else {
      where.status = status;
    }
  }

  return await prisma.onlineOrder.findMany({
    where,
    include: {
      customer: true,
      assignedStaff: {
        select: { id: true, name: true, email: true, phone: true },
      },
      items: { include: { medicine: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPendingOrdersCountService = async () => {
  return await prisma.onlineOrder.count({ where: { status: 'PENDING' } });
};

export const acceptOnlineOrderService = async (orderId) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.onlineOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');
    if (order.status !== 'PENDING') {
      throw new Error(`Order cannot be accepted because current status is ${order.status}`);
    }

    await deductOrderStock(tx, order);

    const updatedOrder = await tx.onlineOrder.update({
      where: { id: orderId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: {
        assignedStaff: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { medicine: true } },
      },
    });

    return updatedOrder;
  });
};

// Backwards-compatible alias
export const approveOnlineOrderService = acceptOnlineOrderService;

export const packOnlineOrderService = async (orderId) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.onlineOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');
    if (!['PENDING', 'ACCEPTED', 'APPROVED'].includes(order.status)) {
      throw new Error(`Cannot mark order as packed from status ${order.status}`);
    }

    const updateData = {
      status: 'PACKED',
      packedAt: new Date(),
    };

    if (order.status === 'PENDING' && !order.acceptedAt) {
      await deductOrderStock(tx, order);
      updateData.acceptedAt = new Date();
    }

    return await tx.onlineOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        assignedStaff: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { medicine: true } },
      },
    });
  });
};

export const assignStaffAndShipOrderService = async (orderId, staffId) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.onlineOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');
    if (['DELIVERED', 'REJECTED'].includes(order.status)) {
      throw new Error(`Cannot assign staff to an order with status ${order.status}`);
    }

    if (staffId) {
      const staff = await tx.user.findUnique({ where: { id: staffId } });
      if (!staff || staff.role !== 'staff') {
        throw new Error('Selected staff member not found');
      }
    }

    const updateData = {
      status: 'SHIPPED',
      shippedAt: order.shippedAt || new Date(),
    };

    if (staffId) {
      updateData.assignedStaffId = staffId;
    }

    if (order.status === 'PENDING' && !order.acceptedAt) {
      await deductOrderStock(tx, order);
      updateData.acceptedAt = new Date();
    }

    return await tx.onlineOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        assignedStaff: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { medicine: true } },
      },
    });
  });
};

export const deliverOnlineOrderService = async (orderId, currentUser) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.onlineOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');
    if (order.status === 'DELIVERED') {
      throw new Error('Order is already marked as delivered');
    }
    if (order.status === 'REJECTED') {
      throw new Error('Cannot deliver a rejected order');
    }

    const userRole = String(currentUser?.role || '').toLowerCase();
    if (userRole === 'staff') {
      if (order.assignedStaffId !== currentUser.id) {
        throw new Error('You can only complete delivery for orders assigned to you');
      }
      if (order.status !== 'SHIPPED') {
        throw new Error('Order must be in SHIPPED status to mark delivery complete');
      }
    }

    const updateData = {
      status: 'DELIVERED',
      deliveredAt: new Date(),
      paymentStatus: 'PAID',
    };

    if (order.status === 'PENDING' && !order.acceptedAt) {
      await deductOrderStock(tx, order);
      updateData.acceptedAt = new Date();
    }

    const invoiceNo = await recordDeliveredSale(tx, order, currentUser);

    const updatedOrder = await tx.onlineOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        assignedStaff: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { medicine: true } },
      },
    });

    return { ...updatedOrder, invoiceNo };
  });
};

export const rejectOnlineOrderService = async (orderId) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.onlineOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');
    if (['DELIVERED', 'REJECTED'].includes(order.status)) {
      throw new Error(`Cannot reject order in status ${order.status}`);
    }

    // Restore stock if it was already deducted during acceptance
    if (order.acceptedAt || ['ACCEPTED', 'APPROVED', 'PACKED', 'SHIPPED'].includes(order.status)) {
      await restoreOrderStock(tx, order);
    }

    return await tx.onlineOrder.update({
      where: { id: orderId },
      data: {
        status: 'REJECTED',
        assignedStaffId: null,
      },
    });
  });
};

export const getStaffAssignedOrdersService = async (staffId, status) => {
  const where = { assignedStaffId: staffId };
  if (status && status !== 'ALL') {
    where.status = status;
  }

  return await prisma.onlineOrder.findMany({
    where,
    include: {
      customer: {
        select: { id: true, name: true, phone: true, email: true },
      },
      items: { include: { medicine: true } },
    },
    orderBy: { shippedAt: 'desc' },
  });
};

export const getStaffDashboardService = async (staffId) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    activeAssignedCount,
    deliveredTodayCount,
    totalDeliveredCount,
    totalMedicinesCount,
    lowStockCount,
    todaySalesAgg,
    recentAssignedOrders,
  ] = await Promise.all([
    prisma.onlineOrder.count({
      where: { assignedStaffId: staffId, status: 'SHIPPED' },
    }),
    prisma.onlineOrder.count({
      where: {
        assignedStaffId: staffId,
        status: 'DELIVERED',
        deliveredAt: { gte: startOfToday },
      },
    }),
    prisma.onlineOrder.count({
      where: { assignedStaffId: staffId, status: 'DELIVERED' },
    }),
    prisma.medicine.count(),
    prisma.medicine.count({ where: { stock: { lte: 10 } } }),
    prisma.sale.aggregate({
      where: { staffId, date: { gte: startOfToday } },
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
    prisma.onlineOrder.findMany({
      where: { assignedStaffId: staffId, status: 'SHIPPED' },
      include: {
        items: { include: { medicine: true } },
      },
      orderBy: { shippedAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    activeAssignedCount,
    deliveredTodayCount,
    totalDeliveredCount,
    totalMedicinesCount,
    lowStockCount,
    todaySalesCount: todaySalesAgg._count?.id || 0,
    todaySalesAmount: todaySalesAgg._sum?.totalAmount || 0,
    recentAssignedOrders,
  };
};
