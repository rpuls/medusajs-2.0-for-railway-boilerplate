# InPost Integration for Medusa 2.0

This document describes the complete InPost integration implementation for your Medusa 2.0 project with storefront, enabling customers to select InPost lockers as a delivery option during checkout.

## Overview

The integration provides:

- **Backend**: Custom fulfillment provider for InPost API integration
- **Frontend**: Locker selection component with search functionality
- **API**: Endpoints for retrieving available InPost lockers
- **Types**: Complete TypeScript definitions

## Backend Implementation

### 1. Fulfillment Provider Service

**File**: `backend/src/modules/inpost-fulfillment/service.ts`

A complete fulfillment provider service that implements:

- InPost API integration for shipment creation
- Locker search functionality
- Shipment tracking and management
- Price calculation for different InPost services

### 2. Module Configuration

**File**: `backend/src/modules/inpost-fulfillment/index.ts`

Module provider export following Medusa 2.0 patterns.

### 3. Environment Configuration

**Files**:

- `backend/src/lib/constants.ts` - Environment variable definitions
- `backend/.env.template` - Environment template with InPost variables

Required environment variables:

```env
INPOST_API_KEY=your-inpost-api-key
INPOST_ORGANIZATION_ID=your-organization-id
INPOST_ENVIRONMENT=sandbox # or production
```

### 4. Medusa Configuration

**File**: `backend/medusa-config.js`

The InPost fulfillment provider is automatically added to the FULFILLMENT module when the required environment variables are present.

### 5. API Endpoints

**File**: `backend/src/api/store/inpost/lockers/route.ts`

RESTful endpoint for retrieving InPost lockers:

- `GET /store/inpost/lockers` - Search lockers by location/address

### 6. Seed Data

**File**: `backend/src/scripts/seed.ts`

Automatically creates InPost shipping options when seeding the database if InPost is configured.

## Frontend Implementation

### 1. Data Layer

**File**: `storefront/src/lib/data/inpost.ts`

Functions for:

- Fetching InPost lockers from API
- Getting user's current location
- Type-safe data handling

### 2. Locker Selector Component

**File**: `storefront/src/modules/checkout/components/inpost-locker-selector/index.tsx`

React component providing:

- Search by city, postal code, or current location
- Interactive locker list with detailed information
- Selection state management
- Error handling and loading states

### 3. Checkout Integration

**File**: `storefront/src/modules/checkout/components/shipping/index.tsx`

Enhanced shipping component that:

- Detects InPost shipping methods
- Shows locker selector when InPost is selected
- Validates locker selection before proceeding
- Displays selected locker information

### 4. TypeScript Types

**File**: `storefront/src/types/inpost.ts`

Complete type definitions for InPost integration.

## Setup Instructions

### 1. Backend Setup

1. **Install dependencies** (if any additional packages are needed):

   ```bash
   cd backend
   pnpm install
   ```

2. **Configure environment variables**:

   ```bash
   cp .env.template .env
   # Add your InPost API credentials to .env
   ```

3. **Build and start**:

   ```bash
   pnpm build
   pnpm dev
   ```

4. **Seed database** (optional):
   ```bash
   pnpm exec medusa exec ./src/scripts/seed.ts
   ```

### 2. Frontend Setup

1. **Install dependencies**:

   ```bash
   cd storefront
   pnpm install
   ```

2. **Configure environment**:

   ```bash
   # Ensure NEXT_PUBLIC_MEDUSA_BACKEND_URL points to your backend
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

## InPost API Integration

### Supported Features

- **Locker Search**: Search by location, city, or postal code
- **Shipment Creation**: Create shipments with InPost API
- **Tracking**: Retrieve shipment status
- **Pricing**: Dynamic pricing calculation

### API Endpoints Used

- `GET /v1/points` - Search for InPost lockers
- `POST /v1/organizations/{org_id}/shipments` - Create shipment
- `GET /v1/organizations/{org_id}/shipments/{id}/tracking` - Track shipment

## User Experience Flow

1. **Checkout Process**:

   - Customer enters shipping address
   - Available shipping methods are displayed
   - If InPost is selected, locker selector appears

2. **Locker Selection**:

   - Auto-search based on shipping address
   - Manual search by city/postal code
   - Location-based search using GPS
   - Interactive locker list with details

3. **Order Completion**:
   - Selected locker is validated
   - Locker information is stored with shipping method
   - Order proceeds to payment

## Configuration Options

### Backend Configuration

```javascript
// In medusa-config.js
{
  resolve: './src/modules/inpost-fulfillment',
  id: 'inpost',
  options: {
    api_key: INPOST_API_KEY,
    organization_id: INPOST_ORGANIZATION_ID,
    environment: INPOST_ENVIRONMENT, // 'sandbox' | 'production'
  },
}
```

### Supported Countries

The integration supports InPost services in:

- Poland (PL)
- United Kingdom (GB)
- Italy (IT)

Additional countries can be added by updating the country selector in the frontend component.

## Customization

### Adding New Countries

1. Update the country selector in `inpost-locker-selector/index.tsx`
2. Add country-specific logic if needed
3. Test with InPost API for the new country

### Custom Styling

The components use Tailwind CSS classes and can be easily customized by modifying the className properties.

### Additional InPost Services

To add more InPost services (e.g., different delivery types):

1. Update `getFulfillmentOptions()` in the service
2. Add corresponding logic in `calculatePrice()`
3. Update frontend to handle new service types

## Testing

### Testing with Sandbox

1. Set `INPOST_ENVIRONMENT=sandbox` in your .env file
2. Use InPost sandbox API credentials
3. Test the complete flow without real shipments

### E2E Testing

The integration includes data-testid attributes for testing:

- `delivery-options-container`
- `delivery-option-radio`
- `submit-delivery-option-button`

## Troubleshooting

### Common Issues

1. **API Key Not Working**:

   - Verify credentials in InPost developer portal
   - Check environment (sandbox vs production)
   - Ensure organization ID is correct

2. **No Lockers Found**:

   - Verify the search location is in supported countries
   - Check if the area has InPost coverage
   - Try expanding search radius

3. **Build Errors**:

   - Run `pnpm build` to check for TypeScript issues
   - Clear `.medusa/server` directory and rebuild
   - Verify all dependencies are installed

4. **Frontend Issues**:
   - Check browser console for errors
   - Verify backend API is accessible
   - Test API endpoints directly

## Security Considerations

- InPost API keys are server-side only
- Frontend communicates with backend API endpoints
- Input validation on both frontend and backend
- Error handling prevents sensitive information exposure

## Production Deployment

1. **Environment Variables**:

   - Set production InPost API credentials
   - Update `INPOST_ENVIRONMENT=production`
   - Configure proper CORS settings

2. **Performance**:

   - API responses are cached where appropriate
   - Debounce search inputs for better UX
   - Optimize locker list rendering

3. **Monitoring**:
   - Monitor InPost API usage and limits
   - Log fulfillment operations for debugging
   - Set up error tracking for production issues

## Support

For InPost API documentation and support:

- [InPost Developer Portal](https://inpost.pl/en/integration)
- [InPost API Documentation](https://api-shipx-pl.easypack24.net/v1/documentation)

For Medusa-specific issues:

- [Medusa Documentation](https://docs.medusajs.com/)
- [Medusa Community Discord](https://discord.gg/medusajs)

## Contributing

When contributing to this integration:

1. Follow the existing code patterns
2. Add proper TypeScript types
3. Update documentation for any changes
4. Test with both sandbox and production environments
5. Consider backward compatibility
