import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await prisma.storefrontSetting.findUnique({
      where: { id: "settings" },
      include: { discountTiers: true },
    });
    return NextResponse.json(
      settings || {
        minOrderForFreeDelivery: 500,
        deliveryCharge: 20,
        discountTiers: [],
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        minOrderForFreeDelivery: 500,
        deliveryCharge: 20,
        discountTiers: [],
      },
      { status: 200 }
    );
  }
}
