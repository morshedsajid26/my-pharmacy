'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    return await prisma.customer.findMany({
      include: {
        sales: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

export async function createCustomer(data) {
  try {
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        status: data.status || "Regular",
        dueAmount: data.dueAmount || 0,
        totalSpent: data.totalSpent || 0
      }
    });
    revalidatePath("/customers");
    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error(error.message || "Failed to create customer");
  }
}

export async function updateCustomer(id, data) {
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        status: data.status || "Regular"
      }
    });
    revalidatePath("/customers");
    return customer;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw new Error("Failed to update customer");
  }
}

export async function payCustomerDue(customerId, amount, waiveAmount = 0) {
  try {
    return await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      const payment = parseFloat(amount);
      const discount = parseFloat(waiveAmount) || 0;
      const newDue = Math.max(0, customer.dueAmount - payment - discount);

      const updated = await tx.customer.update({
        where: { id: customerId },
        data: {
          dueAmount: newDue
        }
      });

      revalidatePath("/customers");
      revalidatePath("/dashboard");
      return updated;
    });
  } catch (error) {
    console.error("Error collecting due payment:", error);
    throw new Error(error.message || "Failed to collect due payment");
  }
}
