import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const tran_id = formData.get("tran_id");
    
    if (tran_id) {
      await prisma.onlineOrder.update({
        where: { transactionId: tran_id },
        data: { 
          paymentStatus: "UNPAID",
          status: "CANCELLED"
        }
      });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/orders?payment=cancelled`, 303);
  } catch (error) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/orders?payment=error`, 303);
  }
}
