import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDistance } from "date-fns";
import { BlockRenderer } from "@/modules/content/components/block-renderer";

type Props = {
  params: {
    slug: string;
    countryCode: string;
  };
};

async function getPost(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/posts?where[slug][equals]=${slug}&depth=2`,
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
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The blog post you are looking for does not exist.",
    };
  }

  return {
    title: post.meta?.title || post.title,
    description: post.meta?.description || "",
    openGraph: post.featuredImage
      ? {
          images: [
            {
              url: post.featuredImage.url,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
        }
      : undefined,
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="content-container py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center text-gray-500 mb-6">
          {post.author && (
            <div className="flex items-center mr-4">
              {post.author.avatar ? (
                <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
                  <Image
                    src={post.author.avatar.url}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
              )}
              <span>{post.author.name}</span>
            </div>
          )}
          
          {post.publishedAt && (
            <span>
              {formatDistance(new Date(post.publishedAt), new Date(), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
        
        {post.featuredImage && (
          <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage.url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        {post.blocks && post.blocks.length > 0 ? (
          <BlockRenderer blocks={post.blocks} />
        ) : post.content ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : null}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/posts?limit=100`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const { docs } = await response.json();
    
    return docs.map((post: any) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for posts:", error);
    return [];
  }
}
