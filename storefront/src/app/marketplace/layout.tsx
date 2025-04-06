import { Metadata } from "next";
import MarketplaceNav from "@/modules/marketplace/components/marketplace-nav";

export const metadata: Metadata = {
  title: "Digital Asset Marketplace",
  description: "Browse and purchase digital assets from creators around the world.",
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="content-container">
      <MarketplaceNav />
      {children}
    </div>
  );
}
