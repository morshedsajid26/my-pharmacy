import medicinesData from "./medicines_bd.json";

export const MEDICINES = medicinesData;

export const SALES_DATA = [
  { id: "INV-1001", date: "2024-05-20", totalAmount: 450.00, items: 3, profit: 50.00 },
  { id: "INV-1002", date: "2024-05-21", totalAmount: 220.00, items: 2, profit: 30.00 },
  { id: "INV-1003", date: "2024-05-21", totalAmount: 1200.00, items: 10, profit: 150.00 },
  { id: "INV-1004", date: "2024-05-22", totalAmount: 340.00, items: 5, profit: 45.00 },
];

export const STATISTICS = {
  todaySales: 4500,
  todayPurchase: 3200,
  monthlySales: 125000,
  yearlySales: 1500000,
  totalStockValue: 850000,
  lowStockCount: 12,
  stockOutCount: 5,
};
