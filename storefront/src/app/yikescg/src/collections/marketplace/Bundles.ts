import { CollectionConfig } from 'payload/types';
import { anyone } from '../../access/anyone';
import { authenticated } from '../../access/authenticated';
import { slugField } from '@/fields/slug';

export const Bundles: CollectionConfig = {
  slug: 'bundles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'discountPercentage'],
    group: 'Marketplace',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    ...slugField(), // Optional: Add a slug for bundle pages
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'products',
      type: 'array', // Using array of text Product IDs from Medusa
      label: 'Medusa Product IDs',
      minRows: 1,
      required: true,
      admin: {
        description: 'List the Medusa Product IDs included in this bundle.'
      },
      fields: [
        {
          name: 'productId',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'discountPercentage',
      type: 'number',
      label: 'Discount Percentage',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Percentage discount applied when buying this bundle.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}; 