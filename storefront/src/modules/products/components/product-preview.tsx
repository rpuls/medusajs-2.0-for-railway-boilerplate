'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatAmount } from '../../../lib/util/prices';
import { Badge } from '../../../components/ui/badge';

interface ProductPreviewProps {
  product: any;
}

export function ProductPreview({ product }: ProductPreviewProps) {
  if (!product) return null;

  const { id, title, thumbnail, handle, variants } = product;

  // Get the first variant for pricing
  const firstVariant = variants?.[0];
  const price = firstVariant?.prices?.[0]?.amount;

  // Get metadata
  const engineType = product.metadata?.engineType;
  const assetType = product.metadata?.assetType;
  const pricingType = product.metadata?.pricingType;

  return (
    <Link href={`/products/${handle}`} className="group">
      <div className="relative aspect-square mb-2 overflow-hidden rounded-md bg-gray-100">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Pricing type badge */}
        {pricingType && (
          <div className="absolute top-2 left-2">
            <Badge
              variant={pricingType === 'free' ? 'secondary' : pricingType === 'demo' ? 'outline' : 'default'}
              className="text-xs"
            >
              {pricingType === 'free' ? 'Free' : pricingType === 'demo' ? 'Demo' : 'Paid'}
            </Badge>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {price !== undefined ? formatAmount(price, 'usd') : 'N/A'}
          </p>

          {engineType && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {engineType}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
