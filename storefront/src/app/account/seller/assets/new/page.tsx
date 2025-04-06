import { Metadata } from "next";
import AssetUploadForm from "@/modules/marketplace/components/asset-upload-form";

export const metadata: Metadata = {
  title: "Upload New Asset",
  description: "Upload a new digital asset to your store.",
};

export default async function UploadAssetPage() {
  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Upload New Asset</h1>
        <p className="text-base-regular">
          Fill out the form below to upload a new digital asset to your store.
        </p>
      </div>

      <AssetUploadForm />
    </div>
  );
}
