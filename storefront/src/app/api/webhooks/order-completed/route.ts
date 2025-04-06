import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/data/client';
import { EmailService } from '@/lib/services/email-service';

/**
 * Webhook handler for order completion
 * 
 * This endpoint is called when an order is completed.
 * It sends purchase confirmation emails with download links
 * for any digital assets in the order.
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
    const { order_id } = body;
    
    if (!order_id) {
      return NextResponse.json(
        { error: 'Missing order_id' },
        { status: 400 }
      );
    }

    // Initialize Medusa client
    const client = getClient();
    
    // Get the order details
    const { order } = await client.orders.retrieve(order_id, {
      relations: ['items', 'items.variant', 'items.variant.product'],
    });
    
    // Check if the order contains digital assets
    const hasDigitalAssets = order.items.some(item => 
      item.variant?.product?.metadata?.isDigitalAsset
    );
    
    if (!hasDigitalAssets) {
      return NextResponse.json(
        { message: 'Order does not contain digital assets' },
        { status: 200 }
      );
    }
    
    // Get customer details
    const customer = {
      id: order.customer_id,
      email: order.email,
      first_name: order.shipping_address?.first_name || 'Customer',
    };
    
    // Send purchase confirmation email
    await EmailService.sendPurchaseConfirmation(order, customer);
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Purchase confirmation email sent',
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing order completed webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process order completion' },
      { status: 500 }
    );
  }
}
