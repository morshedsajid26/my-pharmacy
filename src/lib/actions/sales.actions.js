'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSales() {
  try {
    return await prisma.sale.findMany({
      include: {
        customer: true,
        items: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  } catch (error) {
    throw new Error("Failed to fetch sales");
  }
}

export async function recordSale(saleData) {
  const { items, totalAmount, customerId, paidAmount = 0, dueAmount = 0, walkingCustomerName } = saleData;
  
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Create Sale record
      const invoiceNo = `INV-${Date.now()}`;
      
      let totalProfit = 0;
      let subtotal = 0;
      
      // 2. Process items and update stock
      const saleItems = [];
      for (const item of items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId }
        });
        
        if (!medicine || medicine.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${medicine?.name || 'unknown medicine'}`);
        }
        
        const profit = (medicine.sellingPrice - medicine.purchasePrice) * item.quantity;
        totalProfit += profit;
        subtotal += medicine.sellingPrice * item.quantity;
        
        // Update stock
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: {
            stock: { decrement: item.quantity },
            status: (medicine.stock - item.quantity) === 0 ? "Out of Stock" : (medicine.stock - item.quantity) <= 10 ? "Low" : "In Stock"
          }
        });
        
        saleItems.push({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: medicine.sellingPrice,
          totalPrice: medicine.sellingPrice * item.quantity
        });
      }

      const discountAndRoundOff = Math.max(0, subtotal - totalAmount);
      const finalProfit = totalProfit - discountAndRoundOff;

      // Update customer totalSpent and dueAmount if customerId is provided
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalSpent: { increment: totalAmount },
            dueAmount: { increment: dueAmount }
          }
        });
      }
      
      const sale = await tx.sale.create({
        data: {
          invoiceNo,
          totalAmount,
          paidAmount,
          dueAmount,
          profit: finalProfit,
          itemsCount: items.length,
          customerId: customerId || null,
          walkingCustomerName: walkingCustomerName || null,
          items: {
            create: saleItems
          }
        },
        include: {
          items: {
            include: {
              medicine: true
            }
          },
          customer: true
        }
      });
      
      revalidatePath("/sales");
      revalidatePath("/medicines");
      revalidatePath("/dashboard");
      revalidatePath("/reports");
      revalidatePath("/customers");
      
      return sale;
    });
  } catch (error) {
    console.error("Sale record error:", error);
    throw new Error(error.message || "Failed to record sale");
  }
}
