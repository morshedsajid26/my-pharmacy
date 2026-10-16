import prisma from '../../../config/db.js';

export const getCustomersService = async () => {
  return await prisma.customer.findMany({
    include: {
      sales: {
        select: { id: true, invoiceNo: true, date: true, totalAmount: true, paidAmount: true, dueAmount: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getCustomerByIdService = async (id) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { sales: true, orders: true, prescriptions: true },
  });
  if (!customer) throw new Error('Customer not found');
  return customer;
};

export const createCustomerService = async ({ name, phone, email, status = 'Regular', dueAmount = 0, totalSpent = 0, address }) => {
  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) throw new Error('Customer with this phone already exists');

  return await prisma.customer.create({
    data: {
      name,
      phone,
      email: email || null,
      status,
      dueAmount: parseFloat(dueAmount) || 0,
      totalSpent: parseFloat(totalSpent) || 0,
      address: address || null,
    },
  });
};

export const updateCustomerService = async (id, data) => {
  return await prisma.customer.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.status && { status: data.status }),
      ...(data.address !== undefined && { address: data.address }),
    },
  });
};

export const payCustomerDueService = async (customerId, amount, waiveAmount = 0) => {
  return await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new Error('Customer not found');

    const payment = parseFloat(amount);
    const discount = parseFloat(waiveAmount) || 0;
    const newDue = Math.max(0, customer.dueAmount - payment - discount);

    return await tx.customer.update({
      where: { id: customerId },
      data: { dueAmount: newDue },
    });
  });
};
