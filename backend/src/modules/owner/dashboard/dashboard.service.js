import prisma from '../../../config/db.js';

export const getDashboardSummaryService = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const [
    todaySales,
    todayPurchase,
    medicines,
    totalDeliveryChargeAgg,
    monthlyOnlineSalesAgg,
    monthlyShopSalesAgg,
    yearlyOnlineSalesAgg,
    yearlyShopSalesAgg,
    totalTransactions,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { date: { gte: today } },
      _sum: { totalAmount: true, profit: true },
    }),
    prisma.purchase.aggregate({
      where: { date: { gte: today } },
      _sum: { totalAmount: true },
    }),
    prisma.medicine.findMany({
      select: { stock: true, purchasePrice: true, status: true },
    }),
    prisma.onlineOrder.aggregate({
      where: { status: 'APPROVED' },
      _sum: { deliveryCharge: true },
    }),
    prisma.sale.aggregate({
      where: { date: { gte: startOfMonth }, isOnline: true },
      _sum: { totalAmount: true },
    }),
    prisma.sale.aggregate({
      where: { date: { gte: startOfMonth }, isOnline: false },
      _sum: { totalAmount: true },
    }),
    prisma.sale.aggregate({
      where: { date: { gte: startOfYear }, isOnline: true },
      _sum: { totalAmount: true },
    }),
    prisma.sale.aggregate({
      where: { date: { gte: startOfYear }, isOnline: false },
      _sum: { totalAmount: true },
    }),
    prisma.sale.count(),
  ]);

  const totalStockValue = medicines.reduce((acc, med) => acc + med.stock * med.purchasePrice, 0);
  const lowStockCount = medicines.filter((m) => m.stock > 0 && m.stock <= 10).length;
  const stockOutCount = medicines.filter((m) => m.stock === 0).length;

  const mOnlineSales = monthlyOnlineSalesAgg._sum.totalAmount || 0;
  const mShopSales = monthlyShopSalesAgg._sum.totalAmount || 0;
  const yOnlineSales = yearlyOnlineSalesAgg._sum.totalAmount || 0;
  const yShopSales = yearlyShopSalesAgg._sum.totalAmount || 0;

  return {
    todaySales: todaySales._sum.totalAmount || 0,
    todayProfit: todaySales._sum.profit || 0,
    todayPurchase: todayPurchase._sum.totalAmount || 0,
    monthlySales: mOnlineSales + mShopSales,
    monthlyOnlineSales: mOnlineSales,
    monthlyShopSales: mShopSales,
    yearlySales: yOnlineSales + yShopSales,
    yearlyOnlineSales: yOnlineSales,
    yearlyShopSales: yShopSales,
    totalStockValue,
    lowStockCount,
    stockOutCount,
    totalMedicines: medicines.length,
    totalTransactions,
    totalDeliveryCharge: totalDeliveryChargeAgg._sum.deliveryCharge || 0,
  };
};

export const getChartDataService = async (range = 'month') => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = [];
  const now = new Date();

  if (range === 'day') {
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      dayDate.setHours(0, 0, 0, 0);
      const nextDayDate = new Date(dayDate);
      nextDayDate.setDate(dayDate.getDate() + 1);

      const [dailyOnlineSales, dailyShopSales, dailyPurchase] = await Promise.all([
        prisma.sale.aggregate({
          where: { date: { gte: dayDate, lt: nextDayDate }, isOnline: true },
          _sum: { totalAmount: true, profit: true },
        }),
        prisma.sale.aggregate({
          where: { date: { gte: dayDate, lt: nextDayDate }, isOnline: false },
          _sum: { totalAmount: true, profit: true },
        }),
        prisma.purchase.aggregate({
          where: { date: { gte: dayDate, lt: nextDayDate } },
          _sum: { totalAmount: true },
        }),
      ]);

      const label = dayDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      const onlineAmt = dailyOnlineSales._sum.totalAmount || 0;
      const shopAmt = dailyShopSales._sum.totalAmount || 0;

      chartData.push({
        name: label,
        sales: onlineAmt + shopAmt,
        onlineSales: onlineAmt,
        shopSales: shopAmt,
        purchase: dailyPurchase._sum.totalAmount || 0,
        profit: (dailyOnlineSales._sum.profit || 0) + (dailyShopSales._sum.profit || 0),
      });
    }
  } else if (range === 'year') {
    const currentYear = now.getFullYear();
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      const yearDate = new Date(year, 0, 1);
      const nextYearDate = new Date(year + 1, 0, 1);

      const [yearlyOnlineSales, yearlyShopSales, yearlyPurchase] = await Promise.all([
        prisma.sale.aggregate({
          where: { date: { gte: yearDate, lt: nextYearDate }, isOnline: true },
          _sum: { totalAmount: true, profit: true },
        }),
        prisma.sale.aggregate({
          where: { date: { gte: yearDate, lt: nextYearDate }, isOnline: false },
          _sum: { totalAmount: true, profit: true },
        }),
        prisma.purchase.aggregate({
          where: { date: { gte: yearDate, lt: nextYearDate } },
          _sum: { totalAmount: true },
        }),
      ]);

      const onlineAmt = yearlyOnlineSales._sum.totalAmount || 0;
      const shopAmt = yearlyShopSales._sum.totalAmount || 0;

      chartData.push({
        name: String(year),
        sales: onlineAmt + shopAmt,
        onlineSales: onlineAmt,
        shopSales: shopAmt,
        purchase: yearlyPurchase._sum.totalAmount || 0,
        profit: (yearlyOnlineSales._sum.profit || 0) + (yearlyShopSales._sum.profit || 0),
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const [monthlyOnlineSales, monthlyShopSales, monthlyPurchase] = await Promise.all([
        prisma.sale.aggregate({
          where: { date: { gte: monthDate, lt: nextMonthDate }, isOnline: true },
          _sum: { totalAmount: true, profit: true },
        }),
        prisma.sale.aggregate({
          where: { date: { gte: monthDate, lt: nextMonthDate }, isOnline: false },
          _sum: { totalAmount: true, profit: true },
        }),
        prisma.purchase.aggregate({
          where: { date: { gte: monthDate, lt: nextMonthDate } },
          _sum: { totalAmount: true },
        }),
      ]);

      const onlineAmt = monthlyOnlineSales._sum.totalAmount || 0;
      const shopAmt = monthlyShopSales._sum.totalAmount || 0;

      chartData.push({
        name: months[monthDate.getMonth()],
        sales: onlineAmt + shopAmt,
        onlineSales: onlineAmt,
        shopSales: shopAmt,
        purchase: monthlyPurchase._sum.totalAmount || 0,
        profit: (monthlyOnlineSales._sum.profit || 0) + (monthlyShopSales._sum.profit || 0),
      });
    }
  }

  const categoryCounts = await prisma.medicine.groupBy({
    by: ['category'],
    _count: { id: true },
  });

  const categoryData = categoryCounts.map((c) => ({
    name: c.category,
    value: c._count.id,
  }));

  return {
    monthlyData: chartData,
    categoryData: categoryData.length > 0 ? categoryData : [{ name: 'Tablet', value: 0 }],
  };
};

export const getDailyLedgerService = async (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  const [sales, purchases] = await Promise.all([
    prisma.sale.findMany({
      where: { date: { gte: startDate, lt: endDate } },
      select: { date: true, totalAmount: true, profit: true, isOnline: true },
    }),
    prisma.purchase.findMany({
      where: { date: { gte: startDate, lt: endDate } },
      select: { date: true, totalAmount: true },
    }),
  ]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const ledger = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    sales: 0,
    onlineSales: 0,
    shopSales: 0,
    purchases: 0,
    profit: 0,
    transactions: 0,
  }));

  sales.forEach((sale) => {
    const day = new Date(sale.date).getDate();
    if (day >= 1 && day <= daysInMonth) {
      ledger[day - 1].sales += sale.totalAmount;
      if (sale.isOnline) {
        ledger[day - 1].onlineSales += sale.totalAmount;
      } else {
        ledger[day - 1].shopSales += sale.totalAmount;
      }
      ledger[day - 1].profit += sale.profit;
      ledger[day - 1].transactions += 1;
    }
  });

  purchases.forEach((purchase) => {
    const day = new Date(purchase.date).getDate();
    if (day >= 1 && day <= daysInMonth) {
      ledger[day - 1].purchases += purchase.totalAmount;
    }
  });

  return ledger;
};
