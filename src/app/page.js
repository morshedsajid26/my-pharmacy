import prisma from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/actions/online-customer.actions";
import StorefrontClient from "@/components/StorefrontClient";

export const dynamic = "force-dynamic";

export default async function StorefrontPage() {
  // Pre-fetch active medicines to provide instant initial load
  const medicines = await prisma.medicine.findMany({
    orderBy: { name: "asc" }
  });

  // Pre-fetch current customer session from HTTP-only secure cookie
  const customer = await getCurrentCustomer();

  // Pre-fetch e-commerce storefront delivery & discount settings
  const settings = await prisma.storefrontSetting.findUnique({
    where: { id: "settings" },
    include: { discountTiers: true },
  }) || {
    minOrderForFreeDelivery: 500,
    deliveryCharge: 20,
    discountTiers: [],
  };

  return (
    <StorefrontClient 
      initialMedicines={medicines} 
      initialCustomer={customer} 
      initialSettings={settings}
    />
  );
}
