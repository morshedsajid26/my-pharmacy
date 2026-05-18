'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMedicines(params = {}) {
  try {
    const { search } = params;
    
    const medicines = await prisma.medicine.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ]
      } : {},
      orderBy: { createdAt: 'desc' }
    });
    
    return medicines;
  } catch (error) {
    console.error("Error fetching medicines:", error);
    throw new Error("Failed to fetch medicines");
  }
}

export async function getLowStockMedicines() {
  try {
    return await prisma.medicine.findMany({
      where: {
        stock: { lte: 10 }
      }
    });
  } catch (error) {
    throw new Error("Failed to fetch low stock medicines");
  }
}

export async function addMedicine(data) {
  try {
    const medicine = await prisma.medicine.create({
      data: {
        ...data,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        status: data.stock === 0 ? "Out of Stock" : data.stock <= 10 ? "Low" : "In Stock"
      }
    });
    revalidatePath("/medicines");
    revalidatePath("/dashboard");
    return medicine;
  } catch (error) {
    console.error("Error adding medicine:", error);
    throw new Error("Failed to add medicine");
  }
}

export async function updateMedicine(id, data) {
  try {
    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...data,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        status: data.stock === 0 ? "Out of Stock" : data.stock <= 10 ? "Low" : "In Stock"
      }
    });
    revalidatePath("/medicines");
    revalidatePath("/dashboard");
    return medicine;
  } catch (error) {
    throw new Error("Failed to update medicine");
  }
}

export async function deleteMedicine(id) {
  try {
    const hasSales = await prisma.saleItem.count({ where: { medicineId: id } });
    const hasPurchases = await prisma.purchaseItem.count({ where: { medicineId: id } });
    
    if (hasSales > 0 || hasPurchases > 0) {
      throw new Error(`Cannot delete: Medicine is present in ${hasSales} sales and ${hasPurchases} purchases. Delete them first or update stock to 0.`);
    }

    await prisma.medicine.delete({
      where: { id }
    });
    revalidatePath("/medicines");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Failed to delete medicine");
  }
}
