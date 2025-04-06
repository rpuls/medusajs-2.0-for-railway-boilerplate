import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClient } from '@/lib/data/client';
import { CachedMinioService } from '@/lib/services/cached-minio-service';
import { handleApiError, createErrorResponse } from '@/lib/utils/api-error';
import { withDatabaseRetry } from '@/lib/utils/db-connection';

/**
 * API endpoint to download a purchased digital asset
 *
 * Required query parameters:
 * - order_id: The ID of the order containing the purchased asset
 *
 * Security:
 * - Verifies the user is authenticated
 * - Verifies the user owns the order
 * - Verifies the order contains the requested asset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { variant_id: string } }
) {
  try {
    const { variant_id } = params;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    // Check if required parameters are provided
    if (!variant_id || !orderId) {
      console.error('Download request missing parameters', { variant_id, orderId });
      return createErrorResponse(
        'Missing required parameters',
        400,
        'MISSING_PARAMETERS',
        { variant_id, orderId }
      );
    }

    // Get the authenticated user
    const cookieStore = cookies();
    const medusaSessionCookie = cookieStore.get('_medusa_session');

    if (!medusaSessionCookie?.value) {
      return createErrorResponse(
        'Authentication required',
        401,
        'AUTH_REQUIRED'
      );
    }

    // Initialize Medusa client
    const client = getClient();

    // Verify the order belongs to the authenticated user
    const { order } = await withDatabaseRetry(() => client.orders.retrieve(orderId));

    // Get the current user
    const { customer } = await withDatabaseRetry(() => client.customers.retrieve());

    // Check if the order belongs to the authenticated user
    if (order.customer_id !== customer.id) {
      return createErrorResponse(
        'Unauthorized access to this order',
        403,
        'UNAUTHORIZED_ACCESS'
      );
    }

    // Check if the order contains the requested asset
    const orderItem = order.items.find(item => item.variant_id === variant_id);

    if (!orderItem) {
      return createErrorResponse(
        'Asset not found in this order',
        404,
        'ASSET_NOT_FOUND'
      );
    }

    // Get the product to find the digital asset
    const { product } = await withDatabaseRetry(() => client.products.retrieve(orderItem.variant.product_id));

    // Get the digital asset ID from the product metadata
    const digitalAssetId = product.metadata?.digital_asset_id;

    if (!digitalAssetId) {
      return createErrorResponse(
        'No digital asset associated with this product',
        404,
        'NO_DIGITAL_ASSET'
      );
    }

    // Get the digital asset from MinIO with caching
    const minioService = new CachedMinioService();
    const fileStream = await minioService.getAssetStream(digitalAssetId);

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${product.title}.zip"`);
    headers.set('Content-Type', 'application/octet-stream');

    // Return the file as a download
    return new NextResponse(fileStream, { headers });

  } catch (error) {
    console.error('Error processing download request:', error);
    return handleApiError(error);
  }
}
