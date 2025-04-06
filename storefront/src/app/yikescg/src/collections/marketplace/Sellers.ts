import { CollectionConfig } from 'payload/types';
import { anyone } from '../../access/anyone';
import { authenticated } from '../../access/authenticated';
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';
import { slugField } from '@/fields/slug';

export const Sellers: CollectionConfig = {
  slug: 'sellers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'storeId', 'isVerified'],
    group: 'Marketplace',
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : data?.storeId || '',
          collection: 'sellers',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : data?.storeId || '',
        collection: 'sellers',
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
      name: 'storeId',
      type: 'text',
      required: true,
      admin: {
        description: 'Medusa Store ID',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'banner',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'biography',
      type: 'richText',
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'socialLinks',
      type: 'array',
      admin: {
        description: 'Social media links for this seller',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Twitter', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'GitHub', value: 'github' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Website', value: 'website' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'salesMetrics',
      type: 'group',
      label: 'Sales Metrics',
      admin: {
        readOnly: true,
        description: 'Aggregated sales data for this seller (updated automatically).',
      },
      fields: [
        {
          name: 'totalRevenue',
          label: 'Total Revenue',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'totalSalesCount',
          label: 'Total Sales Count',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'averageRating',
          label: 'Average Rating',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'reviewCount',
          label: 'Review Count',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
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
