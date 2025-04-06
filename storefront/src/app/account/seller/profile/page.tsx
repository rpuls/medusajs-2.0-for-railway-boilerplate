import { Metadata } from "next";
import { SellerProfileEditor } from "@/modules/marketplace/components/seller-profile-editor";

export const metadata: Metadata = {
  title: "Seller Profile",
  description: "Manage your seller profile and settings.",
};

export default async function SellerProfilePage() {
  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Seller Profile</h1>
        <p className="text-base-regular">
          Manage your seller profile, social links, and commission settings.
        </p>
      </div>
      
      <SellerProfileEditor />
    </div>
  );
}
