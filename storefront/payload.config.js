/* payload.config.js */
const { buildConfig } = require('payload/config');

module.exports = buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'sellers',
      labels: { singular: 'Seller', plural: 'Sellers' },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'profileImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'bannerImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    {
      slug: 'assets',
      labels: { singular: 'Asset', plural: 'Assets' },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'categories',
          type: 'array',
          fields: [
            {
              name: 'category',
              type: 'text',
            },
          ],
        },
        {
          name: 'tags',
          type: 'text'
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
        },
        {
          name: 'seller',
          type: 'relationship',
          relationTo: 'sellers',
          required: true,
        },
      ],
    },
    {
      slug: 'reviews',
      labels: { singular: 'Review', plural: 'Reviews' },
      fields: [
        {
          name: 'asset',
          type: 'relationship',
          relationTo: 'assets',
          required: true,
        },
        {
          name: 'seller',
          type: 'relationship',
          relationTo: 'sellers',
          required: true,
        },
        {
          name: 'rating',
          type: 'number',
          required: true,
        },
        {
          name: 'text',
          type: 'textarea',
        },
        {
          name: 'verified',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      slug: 'pages',
      labels: { singular: 'Page', plural: 'Pages' },
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
      ],
    },
    {
      slug: 'media',
      labels: { singular: 'Media', plural: 'Media' },
      upload: {
        staticURL: '/media',
        staticDir: 'public/media',
      },
      fields: [],
    },
  ],
}); 