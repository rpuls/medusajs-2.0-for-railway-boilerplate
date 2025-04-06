import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ProductCollection } from "@/modules/products/components/product-collection";
import { SkeletonProductGrid } from "@/modules/skeletons/components/skeleton-product-grid";

export const metadata: Metadata = {
  title: "Category",
  description: "Browse assets by category.",
};

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const t = await getTranslations("marketplace");

  // In a real implementation, you would fetch the category data
  // const category = await fetchCategoryBySlug(params.slug);
  
  // Placeholder category data
  const category = {
    name: params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: "Browse our collection of high-quality digital assets in this category.",
  };

  // if (!category) {
  //   notFound();
  // }

  return (
    <>
      <div className="flex flex-col py-6">
        <h1 className="text-2xl-semi mb-4">{category.name}</h1>
        <p className="mb-8">{category.description}</p>
        
        <div className="mb-8">
          <h2 className="text-xl-semi mb-4">Filter Options</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="bg-gray-100 px-4 py-2 rounded-md">Price</button>
            <button className="bg-gray-100 px-4 py-2 rounded-md">Rating</button>
            <button className="bg-gray-100 px-4 py-2 rounded-md">Date Added</button>
            <button className="bg-gray-100 px-4 py-2 rounded-md">Tags</button>
          </div>
        </div>
        
        <Suspense fallback={<SkeletonProductGrid />}>
          <ProductCollection title={`Assets in ${category.name}`} />
        </Suspense>
      </div>
    </>
  );
}
