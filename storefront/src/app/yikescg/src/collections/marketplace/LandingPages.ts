import { CollectionConfig } from 'payload/types';
import { slugField } from '../../fields/slug';
import { anyone } from '../../access/anyone';
import { authenticated } from '../../access/authenticated';
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';

export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Marketplace Content',
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'landing-pages',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'landing-pages',
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
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField(),
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'subheading',
          type: 'textarea',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'ctaButton',
          type: 'group',
          fields: [
            {
              name: 'label',
              type: 'text',
            },
            {
              name: 'link',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: [
        {
          slug: 'content',
          fields: [
            {
              name: 'heading',
              type: 'text',
            },
            {
              name: 'content',
              type: 'richText',
            },
          ],
        },
        {
          slug: 'featured-products',
          fields: [
            {
              name: 'heading',
              type: 'text',
            },
            {
              name: 'productIds',
              type: 'array',
              fields: [
                {
                  name: 'productId',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Medusa Product ID',
                  },
                },
              ],
            },
          ],
        },
        {
          slug: 'featured-categories',
          fields: [
            {
              name: 'heading',
              type: 'text',
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'asset-categories',
              hasMany: true,
            },
          ],
        },
        {
          slug: 'testimonials',
          fields: [
            {
              name: 'heading',
              type: 'text',
            },
            {
              name: 'testimonials',
              type: 'array',
              fields: [
                {
                  name: 'quote',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'author',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'role',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
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
