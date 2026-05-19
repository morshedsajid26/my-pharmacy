'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOnlineOrdersAction(status = null) {
  try {
    const where = {};
    if (status) {
      where.status = status;
    }

    const orders = await prisma.onlineOrder.findMany({
      where,
      include: {
        items: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return orders;
  } catch (error) {
    throw new Error("Failed to fetch online orders");
  }
}

export async function getPendingOrdersCountAction() {
  try {
    const count = await prisma.onlineOrder.count({
      where: { status: "PENDING" }
    });
    return count;
  } catch (error) {
    console.error("Failed to get pending orders count:", error);
    return 0;
  }
}

export async function approveOnlineOrderAction(orderId) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch order details with its items
      const order = await tx.onlineOrder.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "PENDING") {
        throw new Error(`Order cannot be approved because its status is ${order.status}`);
      }

      let totalProfit = 0;
      const saleItems = [];

      // 2. Loop through ordered items to check and decrement stock
      for (const item of order.items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId }
        });

        if (!medicine) {
          throw new Error(`Medicine not found in inventory!`);
        }

        if (medicine.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${medicine.name}. Only ${medicine.stock} left in inventory.`);
        }

        // Calculate profit for this item
        const profit = (medicine.sellingPrice - medicine.purchasePrice) * item.quantity;
        totalProfit += profit;

        // Decrement stock and update status in database
        const newStock = medicine.stock - item.quantity;
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: {
            stock: newStock,
            status: newStock === 0 ? "Out of Stock" : newStock <= 10 ? "Low" : "In Stock"
          }
        });

        saleItems.push({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: medicine.sellingPrice,
          totalPrice: item.totalPrice
        });
      }

      // 3. Sync customer with Dashboard CRM
      let dbCustomer = await tx.customer.findUnique({
        where: { phone: order.customerPhone }
      });

      if (!dbCustomer) {
        dbCustomer = await tx.customer.create({
          data: {
            name: order.customerName,
            phone: order.customerPhone,
            dueAmount: 0,
            totalSpent: order.totalAmount,
            status: "Regular"
          }
        });
      } else {
        await tx.customer.update({
          where: { id: dbCustomer.id },
          data: {
            totalSpent: { increment: order.totalAmount }
          }
        });
      }

      // 4. Create standard Sales entry in the admin system
      const invoiceNo = `INV-${Date.now()}`;
      await tx.sale.create({
        data: {
          invoiceNo,
          totalAmount: order.totalAmount,
          paidAmount: order.totalAmount, // Assuming online orders are cash on delivery / completed upon delivery
          dueAmount: 0,
          profit: totalProfit,
          itemsCount: order.items.length,
          customerId: dbCustomer.id,
          walkingCustomerName: null,
          isOnline: true,
          items: {
            create: saleItems
          }
        }
      });

      // 5. Update OnlineOrder status to APPROVED
      const updatedOrder = await tx.onlineOrder.update({
        where: { id: orderId },
        data: {
          status: "APPROVED"
        }
      });

      // 6. Revalidate all cache paths so the dashboard updates immediately
      revalidatePath("/sales");
      revalidatePath("/medicines");
      revalidatePath("/dashboard");
      revalidatePath("/reports");
      revalidatePath("/customers");
      revalidatePath("/online-orders");

      return {
        success: true,
        invoiceNo,
        orderNo: updatedOrder.orderNo
      };
    });
  } catch (error) {
    console.error("Error approving online order:", error);
    throw new Error(error.message || "Failed to approve online order");
  }
}

export async function rejectOnlineOrderAction(orderId) {
  try {
    const order = await prisma.onlineOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "PENDING") {
      throw new Error(`Order cannot be rejected because its status is already ${order.status}`);
    }

    const updatedOrder = await prisma.onlineOrder.update({
      where: { id: orderId },
      data: {
        status: "REJECTED"
      }
    });

    revalidatePath("/online-orders");
    return {
      success: true,
      orderNo: updatedOrder.orderNo
    };
  } catch (error) {
    throw new Error(error.message || "Failed to reject online order");
  }
}

/** Fetch current storefront settings including discount tiers */
export async function getStorefrontSettingsAction() {
  const settings = await prisma.storefrontSetting.findUnique({
    where: { id: "settings" },
    include: { discountTiers: true },
  });
  return settings;
}

/** Update storefront settings and discount tiers */
export async function updateStorefrontSettingsAction(payload) {
  const {
    minOrderForFreeDelivery,
    deliveryCharge,
    discountTiers,
  } = payload;

  try {
    // Upsert main settings row
    await prisma.storefrontSetting.upsert({
      where: { id: "settings" },
      update: {
        minOrderForFreeDelivery: parseFloat(minOrderForFreeDelivery) || 0,
        deliveryCharge: parseFloat(deliveryCharge) || 0,
      },
      create: {
        id: "settings",
        minOrderForFreeDelivery: parseFloat(minOrderForFreeDelivery) || 0,
        deliveryCharge: parseFloat(deliveryCharge) || 0,
      },
    });

    // Replace all existing tiers with the new set
    await prisma.discountTier.deleteMany({ where: { settingId: "settings" } });
    if (Array.isArray(discountTiers) && discountTiers.length > 0) {
      await prisma.discountTier.createMany({
        data: discountTiers.map((t) => ({
          settingId: "settings",
          threshold: parseFloat(t.threshold),
          percent: parseFloat(t.percent),
        })),
      });
    }

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update storefront settings:", error);
    throw new Error(error.message || "Failed to update storefront settings");
  }
}
