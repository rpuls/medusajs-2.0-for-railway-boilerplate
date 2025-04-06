import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { sdk } from "@/lib/config";

export const metadata: Metadata = {
  title: "My Bundles",
  description: "Manage your digital asset bundles.",
};

export default async function BundlesPage() {
  // In a real implementation, you would fetch only bundles created by the current seller
  const { products } = await sdk.products.list({
    is_giftcard: false,
    limit: 100,
    type: "bundle",
  });

  // Filter to only include bundles (products with isBundle metadata)
  const bundles = products.filter(product => product.metadata?.isBundle === true);

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl-semi">My Bundles</h1>
          <Button asChild>
            <Link href="/account/seller/bundles/new">Create New Bundle</Link>
          </Button>
        </div>
        <p className="text-base-regular">
          Create and manage bundles of your digital assets.
        </p>
      </div>

      {bundles.length > 0 ? (
        <div className="grid grid-cols-1 gap-y-8">
          {bundles.map((bundle) => {
            const regularPrice = bundle.metadata?.regularPrice || 0;
            const discountPercentage = bundle.metadata?.discountPercentage || 0;
            const bundledProducts = bundle.metadata?.bundledProducts || [];
            
            return (
              <div key={bundle.id} className="border rounded-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {bundle.thumbnail && (
                    <div className="w-full md:w-48 h-48 relative">
                      <Image
                        src={bundle.thumbnail}
                        alt={bundle.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h2 className="text-xl font-semibold">{bundle.title}</h2>
                      <div className="flex items-center gap-2">
                        {discountPercentage > 0 && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {discountPercentage}% OFF
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          {regularPrice > 0 && (
                            <span className="text-gray-500 line-through">${regularPrice.toFixed(2)}</span>
                          )}
                          <span className="font-bold">
                            ${(bundle.variants[0]?.prices[0]?.amount / 100 || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{bundle.description}</p>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Includes {bundledProducts.length} assets:</h3>
                      <div className="flex flex-wrap gap-2">
                        {bundledProducts.map((productId: string, index: number) => (
                          <span key={productId} className="bg-gray-100 px-2 py-1 rounded text-sm">
                            Asset {index + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/account/seller/bundles/${bundle.id}`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${bundle.handle}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 p-12 rounded-full mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No bundles yet</h2>
          <p className="text-gray-500 mb-6">
            Create your first bundle to offer multiple assets at a discounted price.
          </p>
          <Button asChild>
            <Link href="/account/seller/bundles/new">Create Your First Bundle</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
