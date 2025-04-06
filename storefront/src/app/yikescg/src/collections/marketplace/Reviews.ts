import { CollectionConfig } from 'payload/types';
import { anyone } from '../../access/anyone';
import { authenticated } from '../../access/authenticated';

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rating', 'productId', 'isVerified'],
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Rating from 1 to 5 stars',
      },
    },
    {
      name: 'productId',
      type: 'text',
      required: true,
      admin: {
        description: 'Medusa Product ID',
      },
    },
    {
      name: 'customerId',
      type: 'text',
      required: true,
      admin: {
        description: 'Medusa Customer ID',
      },
    },
    {
      name: 'customerName',
      type: 'text',
      admin: {
        description: 'Display name of the customer',
      },
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is a verified purchase review',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this review is published and visible',
      },
    },
    {
      name: 'reviewDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      defaultValue: () => new Date(),
    },
  ],
};
