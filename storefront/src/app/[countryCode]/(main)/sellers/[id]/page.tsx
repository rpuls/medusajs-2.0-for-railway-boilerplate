import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductCollection } from "@/modules/products/components/product-collection";
import { BlockRenderer } from "@/modules/content/components/block-renderer";

type Props = {
  params: {
    id: string;
    countryCode: string;
  };
};

async function getSeller(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/sellers?where[id][equals]=${id}&depth=2`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const { docs } = await response.json();
    return docs[0] || null;
  } catch (error) {
    console.error("Error fetching seller:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const seller = await getSeller(params.id);

  if (!seller) {
    return {
      title: "Seller Not Found",
      description: "The seller you are looking for does not exist.",
    };
  }

  return {
    title: seller.meta?.title || seller.name,
    description: seller.meta?.description || seller.bio || "",
    openGraph: seller.banner
      ? {
          images: [
            {
              url: seller.banner.url,
              width: 1200,
              height: 630,
              alt: seller.name,
            },
          ],
        }
      : undefined,
  };
}

export default async function SellerProfile({ params }: Props) {
  const seller = await getSeller(params.id);

  if (!seller) {
    notFound();
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative w-full h-64 bg-gray-200">
        {seller.banner ? (
          <Image
            src={seller.banner.url}
            alt={`${seller.name} banner`}
            fill
            className="object-cover"
            priority
          />
        ) : null}
      </div>

      <div className="content-container py-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col items-center mb-4">
                {seller.avatar ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                    <Image
                      src={seller.avatar.url}
                      alt={seller.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
                )}
                <h1 className="text-xl font-bold">{seller.name}</h1>
                {seller.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                    Verified Seller
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {seller.bio && <p className="text-gray-600">{seller.bio}</p>}

                {/* Social Links */}
                {(seller.website || seller.twitter || seller.github) && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Connect</h3>
                    <div className="space-y-2">
                      {seller.website && (
                        <a
                          href={seller.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          Website
                        </a>
                      )}
                      {seller.twitter && (
                        <a
                          href={`https://twitter.com/${seller.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                          Twitter
                        </a>
                      )}
                      {seller.github && (
                        <a
                          href={`https://github.com/${seller.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                          </svg>
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Commission Status */}
                {seller.acceptsCommissions && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Commissions</h3>
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md">
                      <p className="text-sm font-medium">Open for commissions</p>
                      {seller.commissionInfo && (
                        <p className="text-sm mt-1">{seller.commissionInfo}</p>
                      )}
                      <Link
                        href={`/contact?subject=Commission Request&seller=${seller.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                      >
                        Contact for commission
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Seller's Assets */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Assets by {seller.name}</h2>
              <ProductCollection
                title=""
                limit={8}
                showPagination={true}
                // Filter by seller ID in Medusa
                // This assumes you've added sellerId to product metadata
              />
            </div>

            {/* Custom Content Blocks */}
            {seller.blocks && seller.blocks.length > 0 && (
              <div className="mb-12">
                <BlockRenderer blocks={seller.blocks} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
