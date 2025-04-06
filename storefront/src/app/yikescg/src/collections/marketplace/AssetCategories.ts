import { CollectionConfig } from 'payload/types';
import { anyone } from '../../access/anyone';
import { authenticated } from '../../access/authenticated';
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished';
import { slugField } from '@/fields/slug';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';

export const AssetCategories: CollectionConfig = {
  slug: 'asset-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent'],
    group: 'Marketplace',
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'asset-categories',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'asset-categories',
        req,
      }),
  },
  access: {
    read: authenticatedOrPublished,
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
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
