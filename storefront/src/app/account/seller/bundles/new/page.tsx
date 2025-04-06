import { Metadata } from "next";
import BundleCreator from "@/modules/marketplace/components/bundle-creator";

export const metadata: Metadata = {
  title: "Create Bundle",
  description: "Create a new bundle of digital assets.",
};

export default async function CreateBundlePage() {
  return (
    <div className="w-full">
      <BundleCreator />
    </div>
  );
}
