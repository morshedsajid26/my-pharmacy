'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPurchases() {
  return await prisma.purchase.findMany({
    include: { 
      items: {
        include: { medicine: true }
      } 
    },
    orderBy: { date: 'desc' }
  });
}

export async function recordPurchase(purchaseData) {
  const { company, items, totalAmount } = purchaseData;
  
  try {
    return await prisma.$transaction(async (tx) => {
      const invoiceNo = `PUR-${Date.now()}`;
      
      const purchase = await tx.purchase.create({
        data: {
          invoiceNo,
          supplier: company,
          totalAmount,
          items: {
            create: await Promise.all(items.map(async (item) => {
              let medicineId = item.medicineId;
              
              // If medicineId is missing but we have name/company/category, create it
              if (!medicineId && item.name) {
                const newMedicine = await tx.medicine.create({
                  data: {
                    name: item.name,
                    genericName: item.genericName || "",
                    company: item.company || company,
                    category: item.category || "Tablet",
                    purchasePrice: item.unitPrice,
                    sellingPrice: item.sellingPrice || 0,
                    status: "In Stock",
                    stock: 0
                  }
                });
                medicineId = newMedicine.id;
              }

              return {
                medicineId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice
              };
            }))
          }
        }
      });
      
      // Update stocks
      for (const item of items) {
        // We need the medicineId again (it might have been created above)
        // For simplicity, we can just find it by name if medicineId is null
        let medId = item.medicineId;
        if (!medId && item.name) {
          const med = await tx.medicine.findFirst({
            where: { name: item.name, company: item.company || company }
          });
          medId = med?.id;
        }

        if (medId) {
          await tx.medicine.update({
            where: { id: medId },
            data: {
              stock: { increment: item.quantity },
              purchasePrice: item.unitPrice,
              ...(item.sellingPrice > 0 ? { sellingPrice: item.sellingPrice } : {})
            }
          });
        }
      }
      
      revalidatePath("/purchases");
      revalidatePath("/medicines");
      revalidatePath("/dashboard");
      revalidatePath("/reports");
      
      return purchase;
    }, {
      maxWait: 5000,
      timeout: 15000
    });
  } catch (error) {
    console.error("Purchase record error:", error);
    throw new Error("Failed to record purchase");
  }
}

export async function updatePurchase(id, purchaseData) {
  const { company, items, totalAmount } = purchaseData;
  
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch old purchase
      const oldPurchase = await tx.purchase.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!oldPurchase) {
        throw new Error("Purchase not found");
      }

      // 2. Revert old stock
      for (const oldItem of oldPurchase.items) {
        if (oldItem.medicineId) {
          await tx.medicine.update({
            where: { id: oldItem.medicineId },
            data: { stock: { decrement: oldItem.quantity } }
          });
        }
      }

      // 3. Delete old items
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: id }
      });

      // 4. Update purchase and create new items
      const purchase = await tx.purchase.update({
        where: { id },
        data: {
          supplier: company,
          totalAmount,
          items: {
            create: await Promise.all(items.map(async (item) => {
              let medicineId = item.medicineId;
              
              if (!medicineId && item.name) {
                const newMedicine = await tx.medicine.create({
                  data: {
                    name: item.name,
                    genericName: item.genericName || "",
                    company: item.company || company,
                    category: item.category || "Tablet",
                    purchasePrice: item.unitPrice,
                    sellingPrice: item.sellingPrice || 0,
                    status: "In Stock",
                    stock: 0
                  }
                });
                medicineId = newMedicine.id;
              }

              return {
                medicineId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice
              };
            }))
          }
        }
      });
      
      // 5. Apply new stock
      for (const item of items) {
        let medId = item.medicineId;
        if (!medId && item.name) {
          const med = await tx.medicine.findFirst({
            where: { name: item.name, company: item.company || company }
          });
          medId = med?.id;
        }

        if (medId) {
          await tx.medicine.update({
            where: { id: medId },
            data: {
              stock: { increment: item.quantity },
              purchasePrice: item.unitPrice,
              ...(item.sellingPrice > 0 ? { sellingPrice: item.sellingPrice } : {})
            }
          });
        }
      }
      
      revalidatePath("/purchases");
      revalidatePath("/medicines");
      revalidatePath("/dashboard");
      revalidatePath("/reports");
      
      return purchase;
    }, {
      maxWait: 5000,
      timeout: 15000
    });
  } catch (error) {
    console.error("Purchase update error:", error);
    throw new Error("Failed to update purchase");
  }
}

export async function deletePurchase(id) {
  try {
    return await prisma.$transaction(async (tx) => {
      const oldPurchase = await tx.purchase.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!oldPurchase) {
        throw new Error("Purchase not found");
      }

      // Revert stock
      for (const item of oldPurchase.items) {
        if (item.medicineId) {
          await tx.medicine.update({
            where: { id: item.medicineId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      // Delete items
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: id }
      });

      // Delete purchase
      await tx.purchase.delete({
        where: { id }
      });

      revalidatePath("/purchases");
      revalidatePath("/medicines");
      revalidatePath("/dashboard");
      revalidatePath("/reports");

      return { success: true };
    }, {
      maxWait: 5000,
      timeout: 15000
    });
  } catch (error) {
    console.error("Purchase delete error:", error);
    throw new Error("Failed to delete purchase");
  }
}
