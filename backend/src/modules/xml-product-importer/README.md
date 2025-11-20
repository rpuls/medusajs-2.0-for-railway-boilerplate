# XML Product Importer Module

A MedusaJS 2.0 module for importing products from XML files with field mapping, segmentation, and recurring import support.

## Features

- XML parsing from URLs
- Flexible field mapping system
- Save and reuse mappings
- Preview mapping output before import
- Batch processing with segmentation
- Recurring imports with cron scheduling
- Update existing products (by SKU or handle)
- Admin UI for configuration and management

## Usage

The module provides a service that can be resolved from the Medusa container:

```typescript
import { XML_PRODUCT_IMPORTER_MODULE } from './modules/xml-product-importer'
import XmlProductImporterService from './modules/xml-product-importer/service'

const importerService: XmlProductImporterService = container.resolve(
  XML_PRODUCT_IMPORTER_MODULE
)
```

## Field Mapping

Field mappings define how XML fields map to Medusa product structure:

```typescript
{
  name: "My Mapping",
  mappings: [
    {
      xmlPath: "product.title",
      medusaField: "title",
      required: true
    },
    {
      xmlPath: "product.price",
      medusaField: "variants.0.prices.0.amount",
      transform: (value) => parseFloat(value) * 100 // Convert to cents
    }
  ]
}
```

## XML Structure Support

The module supports various XML structures:
- `{ products: [...] }`
- `{ items: [...] }`
- `{ catalog: { product: [...] } }`
- Root-level arrays

## Configuration

Register the module in `medusa-config.js`:

```javascript
{
  key: 'xmlProductImporter',
  resolve: './src/modules/xml-product-importer',
}
```

