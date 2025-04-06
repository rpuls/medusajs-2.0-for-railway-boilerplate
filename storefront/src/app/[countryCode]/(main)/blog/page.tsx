import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { formatDistance } from "date-fns";
import { usePagination } from "@/lib/hooks/use-pagination";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read the latest news and updates from our team.",
};

async function getPosts(limit = 10, offset = 0) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/posts?limit=${limit}&skip=${offset}&sort=-publishedAt&depth=1`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { posts: [], totalCount: 0 };
    }

    const { docs, totalDocs } = await response.json();
    return { posts: docs, totalCount: totalDocs };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], totalCount: 0 };
  }
}

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get pagination parameters from URL
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 12;
  const offset = typeof searchParams.offset === 'string' ? parseInt(searchParams.offset) : 0;
  
  // Fetch posts with pagination
  const { posts, totalCount } = await getPosts(limit, offset);
  
  // Calculate pagination state
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.ceil(totalCount / limit);
  const hasNextPage = offset + limit < totalCount;
  const hasPreviousPage = offset > 0;

  return (
    <div className="content-container py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Blog</h1>

        <div className="grid grid-cols-1 gap-8 mb-12">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col md:flex-row gap-6"
            >
              {post.featuredImage && (
                <div className="relative w-full md:w-1/3 aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={post.featuredImage.url}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  {post.author && (
                    <span className="mr-3">{post.author.name}</span>
                  )}
                  {post.publishedAt && (
                    <span>
                      {formatDistance(new Date(post.publishedAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                {post.excerpt && (
                  <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalCount > limit && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Link
                href={`/blog?limit=${limit}&offset=${Math.max(0, offset - limit)}`}
                className={`px-3 py-2 rounded-md border ${
                  !hasPreviousPage
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50'
                }`}
                aria-disabled={!hasPreviousPage}
                tabIndex={!hasPreviousPage ? -1 : undefined}
              >
                Previous
              </Link>
              
              <span className="text-sm text-gray-500">
                Page {currentPage} of {pageCount}
              </span>
              
              <Link
                href={`/blog?limit=${limit}&offset=${offset + limit}`}
                className={`px-3 py-2 rounded-md border ${
                  !hasNextPage
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50'
                }`}
                aria-disabled={!hasNextPage}
                tabIndex={!hasNextPage ? -1 : undefined}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
