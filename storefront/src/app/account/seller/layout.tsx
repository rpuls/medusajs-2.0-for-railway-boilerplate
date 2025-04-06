import { Metadata } from "next";
import SellerNav from "@/modules/marketplace/components/seller-nav";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Manage your digital assets and sales.",
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SellerNav />
      {children}
    </div>
  );
}
