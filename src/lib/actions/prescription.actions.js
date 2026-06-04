'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPrescriptionOrder(data) {
  try {
    const order = await prisma.prescriptionOrder.create({
      data: {
        customerId: data.customerId,
        prescriptionFile: data.prescriptionFile,
        durationDays: data.durationDays,
        notes: data.notes || null,
        status: "PENDING"
      }
    });
    
    revalidatePath("/profile/prescriptions");
    revalidatePath("/prescription-orders");
    
    return { success: true, order };
  } catch (error) {
    console.error("Error creating prescription order:", error);
    throw new Error("Failed to submit prescription");
  }
}

export async function getCustomerPrescriptionOrders(customerId) {
  try {
    const orders = await prisma.prescriptionOrder.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });
    return orders;
  } catch (error) {
    console.error("Error fetching customer prescription orders:", error);
    throw new Error("Failed to fetch prescriptions");
  }
}

export async function getAllPrescriptionOrders(params = {}) {
  try {
    const { status } = params;
    
    const whereClause = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    
    const orders = await prisma.prescriptionOrder.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            address: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return orders;
  } catch (error) {
    console.error("Error fetching all prescription orders:", error);
    throw new Error("Failed to fetch prescription orders");
  }
}

export async function updatePrescriptionOrderStatus(id, status) {
  try {
    const order = await prisma.prescriptionOrder.update({
      where: { id },
      data: { status }
    });
    
    revalidatePath("/prescription-orders");
    revalidatePath("/profile/prescriptions");
    
    return { success: true, order };
  } catch (error) {
    console.error("Error updating prescription order status:", error);
    throw new Error("Failed to update status");
  }
}
