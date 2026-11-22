import prisma from '../../../config/db.js';

/**
 * Normalizes a date string or Date object to YYYY-MM-DD
 */
export const toDateStr = (d = new Date()) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get financial cash summary & ledger by timeframe (day, month, year)
 */
export const getCashSummaryService = async ({ timeframe = 'day', dateStr, year, month }) => {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // DAILY TIMEFRAME
  if (timeframe === 'day') {
    const targetDateStr = dateStr || toDateStr(now);
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);

    const [
      register,
      daySales,
      dayPurchases,
      dayExpenses,
      dayAdjustments,
    ] = await Promise.all([
      prisma.cashRegister
        ? prisma.cashRegister.findUnique({
            where: { dateStr: targetDateStr },
          }).catch(() => null)
        : Promise.resolve(null),
      prisma.sale
        ? prisma.sale.findMany({
            where: { date: { gte: startOfDay, lte: endOfDay } },
            select: {
              id: true,
              invoiceNo: true,
              date: true,
              totalAmount: true,
              paidAmount: true,
              dueAmount: true,
              profit: true,
              isOnline: true,
              walkingCustomerName: true,
              customer: { select: { name: true, phone: true } },
            },
            orderBy: { date: 'desc' },
          }).catch(() => [])
        : Promise.resolve([]),
      prisma.purchase
        ? prisma.purchase.findMany({
            where: { date: { gte: startOfDay, lte: endOfDay } },
            select: {
              id: true,
              invoiceNo: true,
              date: true,
              supplier: true,
              totalAmount: true,
            },
            orderBy: { date: 'desc' },
          }).catch(() => [])
        : Promise.resolve([]),
      prisma.expense
        ? prisma.expense.findMany({
            where: { date: { gte: startOfDay, lte: endOfDay } },
            orderBy: { date: 'desc' },
          }).catch(() => [])
        : Promise.resolve([]),
      prisma.cashAdjustment
        ? prisma.cashAdjustment.findMany({
            where: { date: { gte: startOfDay, lte: endOfDay } },
            orderBy: { date: 'desc' },
          }).catch(() => [])
        : Promise.resolve([]),
    ]);

    const openingCash = register?.openingBalance || 0;
    const totalSales = daySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const shopSales = daySales.filter(s => !s.isOnline).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const onlineSales = daySales.filter(s => s.isOnline).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const grossProfit = daySales.reduce((sum, s) => sum + (s.profit || 0), 0);

    const totalPurchases = dayPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const manualCashIn = dayAdjustments.filter(a => a.type === 'CASH_IN').reduce((sum, a) => sum + a.amount, 0);
    const manualCashOut = dayAdjustments.filter(a => a.type === 'CASH_OUT').reduce((sum, a) => sum + a.amount, 0);

    const cashExpenses = dayExpenses.filter(e => e.paymentMethod === 'CASH').reduce((sum, e) => sum + e.amount, 0);

    // Expected in drawer = Opening + Shop Sales Cash + Cash In - Cash Out - Cash Expenses
    const expectedCashInDrawer = Math.max(0, openingCash + shopSales + manualCashIn - manualCashOut - cashExpenses);
    const netProfit = grossProfit - totalExpenses;

    // Combined timeline transactions for that day
    const transactions = [
      ...daySales.map(s => ({
        id: `sale-${s.id}`,
        type: 'SALE',
        title: `Sale #${s.invoiceNo}${s.isOnline ? ' (Online)' : ' (POS)'}`,
        party: s.customer?.name || s.walkingCustomerName || 'Walking Customer',
        amount: s.totalAmount,
        flow: 'IN',
        date: s.date,
        profit: s.profit,
      })),
      ...dayPurchases.map(p => ({
        id: `purchase-${p.id}`,
        type: 'PURCHASE',
        title: `Purchase #${p.invoiceNo}`,
        party: p.supplier,
        amount: p.totalAmount,
        flow: 'OUT',
        date: p.date,
      })),
      ...dayExpenses.map(e => ({
        id: `expense-${e.id}`,
        type: 'EXPENSE',
        title: e.title,
        category: e.category,
        party: e.category,
        amount: e.amount,
        flow: 'OUT',
        date: e.date,
        note: e.note,
        paymentMethod: e.paymentMethod,
      })),
      ...dayAdjustments.map(a => ({
        id: `adj-${a.id}`,
        type: a.type,
        title: a.type === 'CASH_IN' ? 'Manual Cash In (Float)' : 'Manual Cash Out (Bank/Drop)',
        party: a.reason,
        amount: a.amount,
        flow: a.type === 'CASH_IN' ? 'IN' : 'OUT',
        date: a.date,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      timeframe: 'day',
      dateStr: targetDateStr,
      register: register || {
        dateStr: targetDateStr,
        openingBalance: 0,
        status: 'OPEN',
      },
      summary: {
        openingCash,
        totalSales,
        shopSales,
        onlineSales,
        totalPurchases,
        totalExpenses,
        cashExpenses,
        manualCashIn,
        manualCashOut,
        grossProfit,
        netProfit,
        expectedCashInDrawer,
        closingBalance: register?.closingBalance ?? null,
        difference: register?.difference ?? null,
        status: register?.status || 'OPEN',
      },
      transactions,
    };
  }

  // MONTHLY TIMEFRAME
  if (timeframe === 'month') {
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    const targetMonth = month !== undefined && month !== null ? parseInt(month, 10) : now.getMonth();

    const startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
    const endDate = new Date(targetYear, targetMonth + 1, 1, 0, 0, 0, 0);
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    const [monthSales, monthPurchases, monthExpenses, monthRegisters] = await Promise.all([
      prisma.sale
        ? prisma.sale.findMany({
            where: { date: { gte: startDate, lt: endDate } },
            select: { date: true, totalAmount: true, profit: true, isOnline: true },
          }).catch(() => [])
        : Promise.resolve([]),
      prisma.purchase
        ? prisma.purchase.findMany({
            where: { date: { gte: startDate, lt: endDate } },
            select: { date: true, totalAmount: true },
          }).catch(() => [])
        : Promise.resolve([]),
      prisma.expense
        ? prisma.expense.findMany({
            where: { date: { gte: startDate, lt: endDate } },
            select: { date: true, amount: true, category: true },
          }).catch(() => [])
        : Promise.resolve([]),
      prisma.cashRegister
        ? prisma.cashRegister.findMany({
            where: { date: { gte: startDate, lt: endDate } },
          }).catch(() => [])
        : Promise.resolve([]),
    ]);

    const dailyLedger = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayDateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const reg = monthRegisters.find(r => r.dateStr === dayDateStr);

      return {
        day,
        dateStr: dayDateStr,
        sales: 0,
        shopSales: 0,
        onlineSales: 0,
        purchases: 0,
        expenses: 0,
        grossProfit: 0,
        netProfit: 0,
        openingBalance: reg?.openingBalance || 0,
        closingBalance: reg?.closingBalance ?? null,
        transactions: 0,
      };
    });

    monthSales.forEach(s => {
      const day = new Date(s.date).getDate();
      if (day >= 1 && day <= daysInMonth) {
        dailyLedger[day - 1].sales += s.totalAmount || 0;
        if (s.isOnline) {
          dailyLedger[day - 1].onlineSales += s.totalAmount || 0;
        } else {
          dailyLedger[day - 1].shopSales += s.totalAmount || 0;
        }
        dailyLedger[day - 1].grossProfit += s.profit || 0;
        dailyLedger[day - 1].transactions += 1;
      }
    });

    monthPurchases.forEach(p => {
      const day = new Date(p.date).getDate();
      if (day >= 1 && day <= daysInMonth) {
        dailyLedger[day - 1].purchases += p.totalAmount || 0;
      }
    });

    monthExpenses.forEach(e => {
      const day = new Date(e.date).getDate();
      if (day >= 1 && day <= daysInMonth) {
        dailyLedger[day - 1].expenses += e.amount || 0;
      }
    });

    dailyLedger.forEach(row => {
      row.netProfit = row.grossProfit - row.expenses;
    });

    const totalSales = dailyLedger.reduce((sum, d) => sum + d.sales, 0);
    const totalPurchases = dailyLedger.reduce((sum, d) => sum + d.purchases, 0);
    const totalExpenses = dailyLedger.reduce((sum, d) => sum + d.expenses, 0);
    const totalGrossProfit = dailyLedger.reduce((sum, d) => sum + d.grossProfit, 0);
    const totalNetProfit = totalGrossProfit - totalExpenses;

    return {
      timeframe: 'month',
      year: targetYear,
      month: targetMonth,
      monthName: months[targetMonth],
      summary: {
        totalSales,
        totalPurchases,
        totalExpenses,
        totalGrossProfit,
        totalNetProfit,
      },
      dailyLedger,
    };
  }

  // YEARLY TIMEFRAME
  const targetYear = year ? parseInt(year, 10) : now.getFullYear();
  const startOfYear = new Date(targetYear, 0, 1);
  const endOfYear = new Date(targetYear + 1, 0, 1);

  const [yearSales, yearPurchases, yearExpenses] = await Promise.all([
    prisma.sale
      ? prisma.sale.findMany({
          where: { date: { gte: startOfYear, lt: endOfYear } },
          select: { date: true, totalAmount: true, profit: true },
        }).catch(() => [])
      : Promise.resolve([]),
    prisma.purchase
      ? prisma.purchase.findMany({
          where: { date: { gte: startOfYear, lt: endOfYear } },
          select: { date: true, totalAmount: true },
        }).catch(() => [])
      : Promise.resolve([]),
    prisma.expense
      ? prisma.expense.findMany({
          where: { date: { gte: startOfYear, lt: endOfYear } },
          select: { date: true, amount: true },
        }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const monthlyLedger = months.map((monthName, idx) => ({
    month: idx,
    monthName,
    sales: 0,
    purchases: 0,
    expenses: 0,
    grossProfit: 0,
    netProfit: 0,
  }));

  yearSales.forEach(s => {
    const m = new Date(s.date).getMonth();
    monthlyLedger[m].sales += s.totalAmount || 0;
    monthlyLedger[m].grossProfit += s.profit || 0;
  });

  yearPurchases.forEach(p => {
    const m = new Date(p.date).getMonth();
    monthlyLedger[m].purchases += p.totalAmount || 0;
  });

  yearExpenses.forEach(e => {
    const m = new Date(e.date).getMonth();
    monthlyLedger[m].expenses += e.amount || 0;
  });

  monthlyLedger.forEach(m => {
    m.netProfit = m.grossProfit - m.expenses;
  });

  const totalSales = monthlyLedger.reduce((sum, m) => sum + m.sales, 0);
  const totalPurchases = monthlyLedger.reduce((sum, m) => sum + m.purchases, 0);
  const totalExpenses = monthlyLedger.reduce((sum, m) => sum + m.expenses, 0);
  const totalGrossProfit = monthlyLedger.reduce((sum, m) => sum + m.grossProfit, 0);
  const totalNetProfit = totalGrossProfit - totalExpenses;

  return {
    timeframe: 'year',
    year: targetYear,
    summary: {
      totalSales,
      totalPurchases,
      totalExpenses,
      totalGrossProfit,
      totalNetProfit,
    },
    monthlyLedger,
  };
};

/**
 * Open or update Cash Register opening balance
 */
export const openRegisterService = async ({ dateStr, openingBalance, note }) => {
  const targetDateStr = dateStr || toDateStr();
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);

  return await prisma.cashRegister.upsert({
    where: { dateStr: targetDateStr },
    update: {
      openingBalance: parseFloat(openingBalance) || 0,
      note: note || undefined,
    },
    create: {
      dateStr: targetDateStr,
      date,
      openingBalance: parseFloat(openingBalance) || 0,
      status: 'OPEN',
      note: note || undefined,
    },
  });
};

/**
 * Close Register with physical counted cash and calculate difference
 */
export const closeRegisterService = async ({ dateStr, closingBalance, note, closedBy }) => {
  const targetDateStr = dateStr || toDateStr();
  const summaryData = await getCashSummaryService({ timeframe: 'day', dateStr: targetDateStr });
  const expectedClosing = summaryData.summary.expectedCashInDrawer;
  const counted = parseFloat(closingBalance) || 0;
  const difference = counted - expectedClosing;

  const [y, m, d] = targetDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);

  return await prisma.cashRegister.upsert({
    where: { dateStr: targetDateStr },
    update: {
      closingBalance: counted,
      expectedClosing,
      difference,
      status: 'CLOSED',
      note: note || undefined,
      closedAt: new Date(),
      closedBy: closedBy || 'Owner',
    },
    create: {
      dateStr: targetDateStr,
      date,
      openingBalance: 0,
      closingBalance: counted,
      expectedClosing,
      difference,
      status: 'CLOSED',
      note: note || undefined,
      closedAt: new Date(),
      closedBy: closedBy || 'Owner',
    },
  });
};

/**
 * Create a new store expense
 */
export const createExpenseService = async (data) => {
  const date = data.date ? new Date(data.date) : new Date();
  return await prisma.expense.create({
    data: {
      title: data.title,
      category: data.category || 'General',
      amount: parseFloat(data.amount),
      date,
      note: data.note || null,
      paymentMethod: data.paymentMethod || 'CASH',
      createdBy: data.createdBy || null,
    },
  });
};

/**
 * Get expenses with optional date filter
 */
export const getExpensesService = async ({ startDate, endDate, category, limit = 50 }) => {
  const where = {};
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }
  if (category) {
    where.category = category;
  }

  return await prisma.expense.findMany({
    where,
    orderBy: { date: 'desc' },
    take: parseInt(limit, 10),
  });
};

/**
 * Delete expense
 */
export const deleteExpenseService = async (id) => {
  return await prisma.expense.delete({
    where: { id },
  });
};

/**
 * Record cash adjustment (Cash In / Out)
 */
export const createCashAdjustmentService = async (data) => {
  const date = data.date ? new Date(data.date) : new Date();
  return await prisma.cashAdjustment.create({
    data: {
      type: data.type, // 'CASH_IN' | 'CASH_OUT'
      amount: parseFloat(data.amount),
      reason: data.reason,
      date,
      createdBy: data.createdBy || null,
    },
  });
};
