import { CollectionConfig } from 'payload/types';
import { anyone } from '../../access/anyone';
import { authenticated } from '../../access/authenticated';
import { slugField } from '@/fields/slug';

export const AssetCategories: CollectionConfig = {
  slug: 'asset-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent'],
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
      name: 'parent',
      type: 'relationship',
      relationTo: 'asset-categories',
      hasMany: false,
      admin: {
        description: 'Parent category (if this is a subcategory)',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for category pages',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        description: 'Order to display categories (lower numbers appear first)',
      },
      defaultValue: 0,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this category is active and visible',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        description: 'Meta title for SEO (defaults to category name if empty)',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        description: 'Meta description for SEO',
      },
    },
  ],
};
