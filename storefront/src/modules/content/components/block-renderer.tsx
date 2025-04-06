'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCollection } from '@/modules/products/components/product-collection';

interface BlockRendererProps {
  blocks: any[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {blocks.map((block, index) => {
        // Determine which block to render based on the blockType
        switch (block.blockType) {
          case 'content':
            return (
              <div key={index} className="prose max-w-none">
                {block.heading && <h2 className="text-2xl font-bold mb-4">{block.heading}</h2>}
                {block.content && (
                  <div dangerouslySetInnerHTML={{ __html: block.content }} />
                )}
              </div>
            );

          case 'media':
            return (
              <div key={index} className="my-8">
                {block.heading && <h2 className="text-2xl font-bold mb-4">{block.heading}</h2>}
                {block.image && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={block.image.url}
                      alt={block.image.alt || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {block.caption && (
                  <p className="text-sm text-gray-500 mt-2 text-center">{block.caption}</p>
                )}
              </div>
            );

          case 'gallery':
            return (
              <div key={index} className="my-8">
                {block.heading && <h2 className="text-2xl font-bold mb-4">{block.heading}</h2>}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {block.images?.map((image: any, i: number) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={image.url}
                        alt={image.alt || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'featured-products':
            return (
              <div key={index} className="my-8">
                <ProductCollection
                  title={block.heading || 'Featured Products'}
                  ids={block.products?.map((p: any) => p.id) || []}
                  limit={block.limit || 4}
                  showPagination={block.showPagination !== false}
                />
              </div>
            );

          case 'cta':
            return (
              <div key={index} className="my-8 bg-gray-50 p-8 rounded-lg text-center">
                {block.heading && <h2 className="text-2xl font-bold mb-4">{block.heading}</h2>}
                {block.text && <p className="mb-6">{block.text}</p>}
                {block.buttons?.map((button: any, i: number) => (
                  <Link
                    key={i}
                    href={button.url || '#'}
                    className={`inline-block px-6 py-3 rounded-md font-medium mr-4 last:mr-0 ${
                      button.style === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {button.label}
                  </Link>
                ))}
              </div>
            );

          case 'testimonials':
            return (
              <div key={index} className="my-8">
                {block.heading && <h2 className="text-2xl font-bold mb-6 text-center">{block.heading}</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {block.testimonials?.map((testimonial: any, i: number) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                      <p className="italic mb-4">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-bold">{testimonial.author}</p>
                        {testimonial.role && <p className="text-gray-500 text-sm">{testimonial.role}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          default:
            // For unknown block types, return null
            return null;
        }
      })}
    </div>
  );
}
