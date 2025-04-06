import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ProductCollection } from "@/modules/products/components/product-collection";
import { SkeletonProductGrid } from "@/modules/skeletons/components/skeleton-product-grid";

export const metadata: Metadata = {
  title: "Asset Marketplace",
  description: "Browse and purchase digital assets from creators around the world.",
};

export default async function MarketplacePage() {
  const t = await getTranslations("marketplace");

  return (
    <>
      <div className="flex flex-col py-6">
        <h1 className="text-2xl-semi mb-4">Digital Asset Marketplace</h1>
        <p className="mb-8">
          Browse and purchase high-quality digital assets from creators around the world.
          Find the perfect assets for your next project.
        </p>
        
        <div className="mb-8">
          <h2 className="text-xl-semi mb-4">Featured Assets</h2>
          <Suspense fallback={<SkeletonProductGrid />}>
            <ProductCollection title="Featured Assets" />
          </Suspense>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl-semi mb-4">New Arrivals</h2>
          <Suspense fallback={<SkeletonProductGrid />}>
            <ProductCollection title="New Arrivals" />
          </Suspense>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl-semi mb-4">Popular Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Category cards would go here */}
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium">3D Models</h3>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium">Textures</h3>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium">Sound Effects</h3>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium">Game Assets</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
