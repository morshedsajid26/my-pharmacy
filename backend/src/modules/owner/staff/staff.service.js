import bcrypt from 'bcryptjs';
import prisma from '../../../config/db.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const getAllStaffService = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const staffList = await prisma.user.findMany({
    where: { role: 'staff' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      profilePicture: true,
      createdAt: true,
      assignedOrders: {
        select: {
          id: true,
          status: true,
        },
      },
      sales: {
        where: { isOnline: false, date: { gte: startOfMonth } },
        select: {
          id: true,
          date: true,
          totalAmount: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return staffList.map((s) => {
    const activeDeliveries = s.assignedOrders.filter((o) => o.status === 'SHIPPED').length;
    const completedDeliveries = s.assignedOrders.filter((o) => o.status === 'DELIVERED').length;

    let todaySalesAmount = 0;
    let todaySalesCount = 0;
    let monthlySalesAmount = 0;

    for (const sale of s.sales) {
      const amt = Number(sale.totalAmount) || 0;
      monthlySalesAmount += amt;
      if (new Date(sale.date) >= startOfToday) {
        todaySalesAmount += amt;
        todaySalesCount += 1;
      }
    }

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      profilePicture: s.profilePicture,
      createdAt: s.createdAt,
      activeDeliveries,
      completedDeliveries,
      totalAssigned: s.assignedOrders.length,
      todaySalesCount,
      todaySalesAmount,
      monthlySalesAmount,
    };
  });
};

export const getStaffDetailsService = async (staffId) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      profilePicture: true,
      createdAt: true,
    },
  });

  if (!staff || staff.role !== 'staff') {
    throw new Error('Staff account not found');
  }

  const [sales, assignedOrders] = await Promise.all([
    prisma.sale.findMany({
      where: { staffId, isOnline: false },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: { include: { medicine: { select: { id: true, name: true } } } },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.onlineOrder.findMany({
      where: { assignedStaffId: staffId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: { include: { medicine: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const makeBucket = () => ({ count: 0, amount: 0, posCount: 0, onlineCount: 0 });
  const salesSummary = {
    today: makeBucket(),
    monthly: makeBucket(),
    yearly: makeBucket(),
    allTime: makeBucket(),
  };

  const dailyMap = new Map();
  const monthlyMap = new Map();
  const yearlyMap = new Map();

  for (const sale of sales) {
    const d = new Date(sale.date);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const amt = Number(sale.totalAmount) || 0;
    const isOnline = Boolean(sale.isOnline);

    const addToBucket = (b) => {
      b.count += 1;
      b.amount += amt;
      if (isOnline) b.onlineCount += 1;
      else b.posCount += 1;
    };

    addToBucket(salesSummary.allTime);
    if (y === todayYear) {
      addToBucket(salesSummary.yearly);
      if (m === todayMonth) {
        addToBucket(salesSummary.monthly);
        if (day === todayDate) {
          addToBucket(salesSummary.today);
        }
      }
    }

    // Daily group (YYYY-MM-DD)
    const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        displayDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        salesCount: 0,
        posCount: 0,
        onlineCount: 0,
        posAmount: 0,
        onlineAmount: 0,
        totalAmount: 0,
      });
    }
    const dayRow = dailyMap.get(dateKey);
    dayRow.salesCount += 1;
    dayRow.totalAmount += amt;
    if (isOnline) {
      dayRow.onlineCount += 1;
      dayRow.onlineAmount += amt;
    } else {
      dayRow.posCount += 1;
      dayRow.posAmount += amt;
    }

    // Monthly group (YYYY-MM)
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        monthKey,
        monthLabel: `${MONTH_NAMES[m]} ${y}`,
        year: y,
        salesCount: 0,
        posCount: 0,
        onlineCount: 0,
        posAmount: 0,
        onlineAmount: 0,
        totalAmount: 0,
      });
    }
    const monthRow = monthlyMap.get(monthKey);
    monthRow.salesCount += 1;
    monthRow.totalAmount += amt;
    if (isOnline) {
      monthRow.onlineCount += 1;
      monthRow.onlineAmount += amt;
    } else {
      monthRow.posCount += 1;
      monthRow.posAmount += amt;
    }

    // Yearly group (YYYY)
    const yearKey = String(y);
    if (!yearlyMap.has(yearKey)) {
      yearlyMap.set(yearKey, {
        year: y,
        salesCount: 0,
        posCount: 0,
        onlineCount: 0,
        posAmount: 0,
        onlineAmount: 0,
        totalAmount: 0,
      });
    }
    const yearRow = yearlyMap.get(yearKey);
    yearRow.salesCount += 1;
    yearRow.totalAmount += amt;
    if (isOnline) {
      yearRow.onlineCount += 1;
      yearRow.onlineAmount += amt;
    } else {
      yearRow.posCount += 1;
      yearRow.posAmount += amt;
    }
  }

  const ordersSummary = {
    total: assignedOrders.length,
    shipped: 0,
    delivered: 0,
    pending: 0,
    accepted: 0,
    packed: 0,
    rejected: 0,
  };

  for (const o of assignedOrders) {
    const st = String(o.status || '').toUpperCase();
    if (st === 'SHIPPED') ordersSummary.shipped += 1;
    else if (st === 'DELIVERED') ordersSummary.delivered += 1;
    else if (st === 'PENDING') ordersSummary.pending += 1;
    else if (st === 'ACCEPTED' || st === 'APPROVED') ordersSummary.accepted += 1;
    else if (st === 'PACKED') ordersSummary.packed += 1;
    else if (st === 'REJECTED') ordersSummary.rejected += 1;
  }

  return {
    staff,
    salesSummary,
    dailySales: Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date)),
    monthlySales: Array.from(monthlyMap.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey)),
    yearlySales: Array.from(yearlyMap.values()).sort((a, b) => b.year - a.year),
    recentSales: sales.slice(0, 50).map((s) => ({
      id: s.id,
      invoiceNo: s.invoiceNo,
      date: s.date,
      totalAmount: s.totalAmount,
      paidAmount: s.paidAmount,
      dueAmount: s.dueAmount,
      itemsCount: s.itemsCount,
      isOnline: s.isOnline,
      customerName: s.customer?.name || s.walkingCustomerName || 'Walk-in Customer',
    })),
    ordersSummary,
    assignedOrders,
  };
};

export const createStaffService = async ({ name, email, phone, password }) => {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = phone ? String(phone).trim() : null;

  if (!cleanName || !cleanEmail || !password) {
    throw new Error('Name, email, and password are required');
  }
  if (String(password).length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } },
  });
  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: 'staff',
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
};

export const updateStaffService = async (id, { name, email, phone, password }) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== 'staff') {
    throw new Error('Staff account not found');
  }

  const updateData = {};
  if (name !== undefined && String(name).trim()) {
    updateData.name = String(name).trim();
  }
  if (phone !== undefined) {
    updateData.phone = phone ? String(phone).trim() : null;
  }
  if (email !== undefined && String(email).trim()) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (cleanEmail !== existing.email.toLowerCase()) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: { equals: cleanEmail, mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (emailTaken) {
        throw new Error('Email is already in use by another account');
      }
      updateData.email = cleanEmail;
    }
  }
  if (password && String(password).trim() !== '') {
    if (String(password).length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    updateData.password = await bcrypt.hash(password, 10);
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
};

export const deleteStaffService = async (id) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== 'staff') {
    throw new Error('Staff account not found');
  }

  await prisma.user.delete({ where: { id } });
  return { deleted: true, id };
};
