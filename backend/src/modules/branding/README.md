# Branding Module

This module provides a singleton branding configuration for the Medusa storefront.

## Features

- Singleton branding configuration (only one config record exists)
- Stores logos (main, footer, favicon) with URL, alt text, width, and height
- Site title and copyright text
- Social links array
- Contact information
- Carousel slides array
- SEO defaults (meta description template, OG image URL, site tagline)

## Data Model

The `BrandingConfig` model uses JSON columns for nested data structures to keep the schema simple and flat.

## API Endpoints

### Admin Endpoints
- `GET /admin/branding` - Get branding configuration
- `POST /admin/branding` - Create or update branding configuration
- `PUT /admin/branding` - Update branding configuration
- `DELETE /admin/branding` - Delete branding configuration (resets to defaults)

### Storefront Endpoints
- `GET /store/branding` - Get branding configuration (public)

## Usage

```typescript
import { BRANDING_MODULE } from "./modules/branding";
import BrandingModuleService from "./modules/branding/service";

// In an API route or workflow
const brandingService: BrandingModuleService = container.resolve(BRANDING_MODULE);
const config = await brandingService.getConfig();
```

