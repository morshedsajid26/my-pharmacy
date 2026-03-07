export const MEDICINES = [
  {
    id: 1,
    name: "Napa Extend",
    company: "Beximco Pharma",
    category: "Tablet",
    purchasePrice: 12.50,
    sellingPrice: 15.00,
    stock: 50,
    expiryDate: "2025-12-31",
    status: "In Stock"
  },
  {
    id: 2,
    name: "Ceevit 250mg",
    company: "Square Pharma",
    category: "Chewable Tablet",
    purchasePrice: 2.50,
    sellingPrice: 3.50,
    stock: 5,
    expiryDate: "2025-06-15",
    status: "Low"
  },
  {
    id: 3,
    name: "Sergel 20mg",
    company: "Healthcare Pharma",
    category: "Capsule",
    purchasePrice: 6.00,
    sellingPrice: 7.00,
    stock: 0,
    expiryDate: "2024-11-20",
    status: "Out of Stock"
  },
  {
    id: 4,
    name: "Fenadin 120mg",
    company: "Renata Ltd.",
    category: "Tablet",
    purchasePrice: 8.50,
    sellingPrice: 10.00,
    stock: 120,
    expiryDate: "2026-03-10",
    status: "In Stock"
  },
  {
    id: 5,
    name: "Antacid",
    company: "ACME",
    category: "Suspension",
    purchasePrice: 45.00,
    sellingPrice: 55.00,
    stock: 8,
    expiryDate: "2025-08-22",
    status: "Low"
  }
];

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
