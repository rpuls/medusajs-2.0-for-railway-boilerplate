import { CollectionConfig } from 'payload/types';
import { anyone } from '../../access/anyone';
import { authenticated } from '../../access/authenticated';
import { slugField } from '@/fields/slug';

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
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
    ...slugField(),
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color code for the tag (e.g., #FF5733)',
      },
    },
  ],
};
