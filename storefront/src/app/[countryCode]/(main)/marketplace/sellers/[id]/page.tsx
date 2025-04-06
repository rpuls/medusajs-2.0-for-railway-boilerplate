import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Image from "next/image";

import { ProductCollection } from "@/modules/products/components/product-collection";
import { SkeletonProductGrid } from "@/modules/skeletons/components/skeleton-product-grid";

export const metadata: Metadata = {
  title: "Seller Profile",
  description: "View seller profile and assets.",
};

export default async function SellerPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTranslations("marketplace");

  // In a real implementation, you would fetch the seller data
  // const seller = await fetchSellerById(params.id);
  
  // Placeholder seller data
  const seller = {
    id: params.id,
    name: "Creative Digital Studio",
    biography: "We create high-quality digital assets for game developers, designers, and creative professionals. Our team has over 10 years of experience in the industry.",
    isVerified: true,
    joinedDate: "January 2022",
    totalSales: 1243,
    rating: 4.8,
  };

  // if (!seller) {
  //   notFound();
  // }

  return (
    <>
      <div className="flex flex-col py-6">
        <div className="w-full h-64 bg-gray-200 mb-6 relative">
          {/* Seller banner image */}
          {/* In a real implementation, you would use the actual banner image */}
          {/* <Image 
            src={seller.banner.url} 
            alt={`${seller.name} banner`}
            fill
            style={{ objectFit: "cover" }}
          /> */}
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center mb-6 gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-300 relative">
            {/* Seller profile image */}
            {/* In a real implementation, you would use the actual profile image */}
            {/* <Image 
              src={seller.photo.url} 
              alt={seller.name}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-full"
            /> */}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl-semi">{seller.name}</h1>
              {seller.isVerified && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Member since {seller.joinedDate}</span>
              <span>{seller.totalSales} sales</span>
              <span>{seller.rating} ★</span>
            </div>
          </div>
          
          <div className="ml-auto mt-4 md:mt-0">
            <button className="btn-primary">Contact Seller</button>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl-semi mb-2">About</h2>
          <p>{seller.biography}</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl-semi mb-4">Assets from this seller</h2>
          <Suspense fallback={<SkeletonProductGrid />}>
            <ProductCollection title={`Assets by ${seller.name}`} />
          </Suspense>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl-semi mb-4">Reviews</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 italic">No reviews yet for this seller.</p>
          </div>
        </div>
      </div>
    </>
  );
}
