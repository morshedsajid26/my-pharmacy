import StorefrontClient from "@/components/StorefrontClient";

export const dynamic = "force-dynamic";

export default function ShopPage() {
  return <StorefrontClient mode="shop" />;
}
