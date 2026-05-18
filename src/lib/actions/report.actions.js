"use server";

import prisma from "@/lib/prisma";

export async function getDashboardSummary() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaySales, todayPurchase, medicines] = await Promise.all([
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
    ]);

    const totalStockValue = medicines.reduce(
      (acc, med) => acc + med.stock * med.purchasePrice,
      0,
    );
    const lowStockCount = medicines.filter(
      (m) => m.stock > 0 && m.stock <= 10,
    ).length;
    const stockOutCount = medicines.filter((m) => m.stock === 0).length;

    const monthlySales = await prisma.sale.aggregate({
      where: {
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
      _sum: { totalAmount: true },
    });

    return {
      todaySales: todaySales._sum.totalAmount || 0,
      todayProfit: todaySales._sum.profit || 0,
      todayPurchase: todayPurchase._sum.totalAmount || 0,
      monthlySales: monthlySales._sum.totalAmount || 0,
      yearlySales: (monthlySales._sum.totalAmount || 0) * 12,
      totalStockValue,
      lowStockCount,
      stockOutCount,
      totalMedicines: medicines.length,
      totalTransactions: await prisma.sale.count(),
    };
  } catch (error) {
    console.error("Dashboard summary error:", error);
    throw new Error("Failed to fetch dashboard summary");
  }
}

export async function getChartData(range = "month") {
  try {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const chartData = [];
    const now = new Date();

    if (range === "day") {
      // Last 7 Days (Per Day)
      for (let i = 6; i >= 0; i--) {
        const dayDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i,
        );
        dayDate.setHours(0, 0, 0, 0);
        const nextDayDate = new Date(dayDate);
        nextDayDate.setDate(dayDate.getDate() + 1);

        const [dailySales, dailyPurchase] = await Promise.all([
          prisma.sale.aggregate({
            where: { date: { gte: dayDate, lt: nextDayDate } },
            _sum: { totalAmount: true, profit: true },
          }),
          prisma.purchase.aggregate({
            where: { date: { gte: dayDate, lt: nextDayDate } },
            _sum: { totalAmount: true },
          }),
        ]);

        const label = dayDate.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
        });

        chartData.push({
          name: label,
          sales: dailySales._sum.totalAmount || 0,
          purchase: dailyPurchase._sum.totalAmount || 0,
          profit: dailySales._sum.profit || 0,
        });
      }
    } else if (range === "year") {
      // Last 5 Years
      const currentYear = now.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        const yearDate = new Date(year, 0, 1);
        const nextYearDate = new Date(year + 1, 0, 1);

        const [yearlySales, yearlyPurchase] = await Promise.all([
          prisma.sale.aggregate({
            where: { date: { gte: yearDate, lt: nextYearDate } },
            _sum: { totalAmount: true, profit: true },
          }),
          prisma.purchase.aggregate({
            where: { date: { gte: yearDate, lt: nextYearDate } },
            _sum: { totalAmount: true },
          }),
        ]);

        chartData.push({
          name: String(year),
          sales: yearlySales._sum.totalAmount || 0,
          purchase: yearlyPurchase._sum.totalAmount || 0,
          profit: yearlySales._sum.profit || 0,
        });
      }
    } else {
      // Default: Last 12 Months
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1,
        );

        const [monthlySales, monthlyPurchase] = await Promise.all([
          prisma.sale.aggregate({
            where: { date: { gte: monthDate, lt: nextMonthDate } },
            _sum: { totalAmount: true, profit: true },
          }),
          prisma.purchase.aggregate({
            where: { date: { gte: monthDate, lt: nextMonthDate } },
            _sum: { totalAmount: true },
          }),
        ]);

        chartData.push({
          name: months[monthDate.getMonth()],
          sales: monthlySales._sum.totalAmount || 0,
          purchase: monthlyPurchase._sum.totalAmount || 0,
          profit: monthlySales._sum.profit || 0,
        });
      }
    }

    // Category distribution
    const categoryCounts = await prisma.medicine.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
    });

    const categoryData = categoryCounts.map((c) => ({
      name: c.category,
      value: c._count.id,
    }));

    return {
      monthlyData: chartData,
      categoryData:
        categoryData.length > 0
          ? categoryData
          : [
              { name: "Tablet", value: 0 },
              { name: "Capsule", value: 0 },
              { name: "Syrup", value: 0 },
              { name: "Injection", value: 0 },
            ],
    };
  } catch (error) {
    console.error("Chart data error:", error);
    throw new Error("Failed to fetch chart data");
  }
}

export async function getTopSellingMedicines() {
  try {
    const topSales = await prisma.saleItem.groupBy({
      by: ["medicineId"],
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topSelling = await Promise.all(
      topSales.map(async (item) => {
        const medicine = await prisma.medicine.findUnique({
          where: { id: item.medicineId },
          select: { name: true, category: true, company: true },
        });
        return {
          id: item.medicineId,
          name: medicine?.name || "Unknown",
          category: medicine?.category || "Unknown",
          company: medicine?.company || "Unknown",
          quantitySold: item._sum.quantity || 0,
          totalRevenue: item._sum.totalPrice || 0,
        };
      })
    );

    return topSelling;
  } catch (error) {
    console.error("Error fetching top selling medicines:", error);
    return [];
  }
}

export async function getExpiringMedicines() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    const expiring = await prisma.medicine.findMany({
      where: {
        expiryDate: {
          not: null,
          lte: threeMonthsLater,
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
      take: 5,
    });

    return expiring;
  } catch (error) {
    console.error("Error fetching expiring medicines:", error);
    return [];
  }
}

export async function getTopProfitableMedicines() {
  try {
    const saleItems = await prisma.saleItem.findMany({
      select: {
        medicineId: true,
        quantity: true,
        totalPrice: true,
        medicine: {
          select: {
            name: true,
            category: true,
            company: true,
            purchasePrice: true,
          }
        }
      }
    });

    const profitMap = {};
    for (const item of saleItems) {
      if (!item.medicine) continue;
      const profit = item.totalPrice - (item.medicine.purchasePrice * item.quantity);
      if (!profitMap[item.medicineId]) {
        profitMap[item.medicineId] = {
          id: item.medicineId,
          name: item.medicine.name,
          category: item.medicine.category,
          company: item.medicine.company,
          quantitySold: 0,
          totalRevenue: 0,
          totalProfit: 0,
        };
      }
      profitMap[item.medicineId].quantitySold += item.quantity;
      profitMap[item.medicineId].totalRevenue += item.totalPrice;
      profitMap[item.medicineId].totalProfit += profit;
    }

    const result = Object.values(profitMap)
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);

    return result;
  } catch (error) {
    console.error("Error in getTopProfitableMedicines:", error);
    return [];
  }
}

export async function getUnsoldMedicines() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Get all medicineIds that HAVE been sold in the last 30 days
    const soldRecent = await prisma.saleItem.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        medicineId: true
      },
      distinct: ['medicineId']
    });

    const soldIds = soldRecent.map(item => item.medicineId);

    // 2. Get medicines whose ID is NOT in soldIds and stock > 0 (only active unsold stock)
    const unsold = await prisma.medicine.findMany({
      where: {
        id: {
          notIn: soldIds
        },
        stock: {
          gt: 0
        }
      },
      orderBy: {
        stock: 'desc'
      },
      take: 5
    });

    return unsold;
  } catch (error) {
    console.error("Error in getUnsoldMedicines:", error);
    return [];
  }
}

export async function getLedgerYears() {
  try {
    const [earliestSale, earliestPurchase] = await Promise.all([
      prisma.sale.findFirst({
        orderBy: { date: 'asc' },
        select: { date: true }
      }),
      prisma.purchase.findFirst({
        orderBy: { date: 'asc' },
        select: { date: true }
      })
    ]);

    const currentYear = new Date().getFullYear();
    let startYear = currentYear;

    if (earliestSale?.date) {
      startYear = Math.min(startYear, new Date(earliestSale.date).getFullYear());
    }
    if (earliestPurchase?.date) {
      startYear = Math.min(startYear, new Date(earliestPurchase.date).getFullYear());
    }

    if (startYear > currentYear || startYear < 2000) {
      startYear = 2024;
    }

    const years = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y);
    }
    return years;
  } catch (error) {
    console.error("Error in getLedgerYears:", error);
    return [new Date().getFullYear()];
  }
}

export async function getDailyLedger(year, month) {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const [sales, purchases] = await Promise.all([
      prisma.sale.findMany({
        where: {
          date: {
            gte: startDate,
            lt: endDate
          }
        },
        select: {
          date: true,
          totalAmount: true,
          profit: true
        }
      }),
      prisma.purchase.findMany({
        where: {
          date: {
            gte: startDate,
            lt: endDate
          }
        },
        select: {
          date: true,
          totalAmount: true
        }
      })
    ]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const ledger = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return {
        day,
        sales: 0,
        purchases: 0,
        profit: 0,
        transactions: 0
      };
    });

    sales.forEach(sale => {
      const day = new Date(sale.date).getDate();
      if (day >= 1 && day <= daysInMonth) {
        ledger[day - 1].sales += sale.totalAmount;
        ledger[day - 1].profit += sale.profit;
        ledger[day - 1].transactions += 1;
      }
    });

    purchases.forEach(purchase => {
      const day = new Date(purchase.date).getDate();
      if (day >= 1 && day <= daysInMonth) {
        ledger[day - 1].purchases += purchase.totalAmount;
      }
    });

    return ledger;
  } catch (error) {
    console.error("Error in getDailyLedger:", error);
    throw new Error("Failed to fetch daily ledger");
  }
}

