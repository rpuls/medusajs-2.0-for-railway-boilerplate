import { CollectionConfig } from 'payload/types';
import { slugField } from '../../fields/slug';
import { anyone } from '../../access/anyone';

export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Marketplace Content',
  },
  access: {
    read: anyone,
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
  ],
};
