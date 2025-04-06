import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/data/client';
import { EmailService } from '@/lib/services/email-service';

/**
 * Webhook handler for asset updates
 * 
 * This endpoint is called when a digital asset is updated.
 * It finds all customers who purchased the asset and sends them
 * update notification emails with download links.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret to ensure the request is legitimate
    const webhookSecret = request.headers.get('x-webhook-secret');
    
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { product_id, version, changelog } = body;
    
    if (!product_id) {
      return NextResponse.json(
        { error: 'Missing product_id' },
        { status: 400 }
      );
    }

    // Initialize Medusa client
    const client = getClient();
    
    // Get the product details
    const { product } = await client.products.retrieve(product_id);
    
    // Check if this is a digital asset
    if (!product.metadata?.isDigitalAsset) {
      return NextResponse.json(
        { error: 'Not a digital asset' },
        { status: 400 }
      );
    }

    // Find all orders containing this product
    const { orders } = await client.orders.list({
      q: product_id,
      limit: 100,
    });
    
    // Extract customers who purchased this asset
    const customers = [];
    
    for (const order of orders) {
      // Check if the order contains the product
      const hasProduct = order.items.some(item => 
        item.variant?.product_id === product_id
      );
      
      if (hasProduct) {
        customers.push({
          id: order.customer_id,
          email: order.email,
          first_name: order.shipping_address?.first_name || 'Customer',
          order_id: order.id,
        });
      }
    }
    
    // Prepare asset data for email
    const asset = {
      id: product.id,
      title: product.title,
      version: version || product.metadata?.version || '1.0',
      changelog: changelog || 'This update includes bug fixes and improvements.',
      variant_id: product.variants[0]?.id,
    };
    
    // Send update notification emails
    await EmailService.sendAssetUpdateNotification(asset, customers);
    
    return NextResponse.json(
      { 
        success: true,
        message: `Update notifications sent to ${customers.length} customers`,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing asset update webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process asset update' },
      { status: 500 }
    );
  }
}
