import { Metadata } from "next";
import SellerDashboardElements from "@/modules/marketplace/components/seller-dashboard-elements";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Manage your digital assets, sales, and seller profile.",
};

export default async function SellerDashboardPage() {
  return (
    <div className="w-full">
      <SellerDashboardElements />
    </div>
  );
}
