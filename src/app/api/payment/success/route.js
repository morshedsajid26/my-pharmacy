import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const tran_id = formData.get("tran_id");
    const val_id = formData.get("val_id"); // Validation ID from SSLCommerz
    
    // Update order status
    if (tran_id) {
      await prisma.onlineOrder.update({
        where: { transactionId: tran_id },
        data: { 
          paymentStatus: "PAID",
        }
      });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/orders?payment=success`, 303);
  } catch (error) {
    console.error("Payment success callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/orders?payment=error`, 303);
  }
}
