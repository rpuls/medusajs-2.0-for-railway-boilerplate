import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/modules/content/components/block-renderer";

type Props = {
  params: {
    slug: string;
    countryCode: string;
  };
};

async function getPage(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/pages?where[slug][equals]=${slug}&depth=2`,
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
    console.error("Error fetching page:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage(params.slug);

  if (!page) {
    return {
      title: "Page Not Found",
      description: "The page you are looking for does not exist.",
    };
  }

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || "",
  };
}

export default async function Page({ params }: Props) {
  const page = await getPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="content-container py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
        
        {page.blocks && page.blocks.length > 0 && (
          <BlockRenderer blocks={page.blocks} />
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/pages?limit=100`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const { docs } = await response.json();
    
    return docs.map((page: any) => ({
      slug: page.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for pages:", error);
    return [];
  }
}
