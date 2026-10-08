import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const tran_id = formData.get("tran_id");
    const status = formData.get("status"); // VALID, FAILED, CANCELLED
    
    if (tran_id && status === "VALID") {
      await prisma.onlineOrder.update({
        where: { transactionId: tran_id },
        data: { 
          paymentStatus: "PAID",
        }
      });
    } else if (tran_id && status === "FAILED") {
      await prisma.onlineOrder.update({
        where: { transactionId: tran_id },
        data: { 
          paymentStatus: "FAILED",
        }
      });
    }
    
    return NextResponse.json({ message: "IPN Received" });
  } catch (error) {
    return NextResponse.json({ error: "IPN Processing Error" }, { status: 500 });
  }
}
