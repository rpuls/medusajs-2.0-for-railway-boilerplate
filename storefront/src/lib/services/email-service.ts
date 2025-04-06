import { render } from '@react-email/render';
import PurchaseConfirmationEmail from '@/emails/purchase-confirmation';
import AssetUpdateEmail from '@/emails/asset-update';
import { medusaClient } from '@/lib/config';

/**
 * Service for sending emails to customers using Medusa's notification system
 */
export class EmailService {

  /**
   * Send a purchase confirmation email with download links
   * @param order The order details
   * @param customer The customer details
   */
  static async sendPurchaseConfirmation(order: any, customer: any) {
    try {
      // Generate secure download links for each digital asset
      const downloadLinks = order.items
        .filter((item: any) => item.variant?.product?.metadata?.isDigitalAsset)
        .map((item: any) => ({
          title: item.title,
          url: `${process.env.NEXT_PUBLIC_URL}/api/downloads/${item.variant_id}?order_id=${order.id}`,
        }));

      // Only send email if there are digital assets in the order
      if (downloadLinks.length === 0) {
        return;
      }

      // Render the email template
      const emailHtml = render(
        PurchaseConfirmationEmail({
          customerName: customer.first_name,
          orderNumber: order.display_id || order.id,
          items: order.items,
          downloadLinks,
          total: order.total,
        })
      );

      // Send the email using Medusa's notification system
      await medusaClient.notifications.send({
        to: customer.email,
        event_name: 'order.placed',
        data: {
          customer,
          order,
          email_template: emailHtml,
          subject: 'Your Purchase Confirmation',
        },
      });

      console.log(`Purchase confirmation email sent to ${customer.email}`);
    } catch (error) {
      console.error('Error sending purchase confirmation email:', error);
    }
  }

  /**
   * Send asset update notifications to customers who purchased the asset
   * @param asset The updated asset details
   * @param customers List of customers who purchased the asset
   */
  static async sendAssetUpdateNotification(asset: any, customers: any[]) {
    try {
      for (const customer of customers) {
        // Render the email template
        const emailHtml = render(
          AssetUpdateEmail({
            customerName: customer.first_name,
            assetTitle: asset.title,
            version: asset.version,
            changelog: asset.changelog,
            downloadUrl: `${process.env.NEXT_PUBLIC_URL}/api/downloads/${asset.variant_id}?order_id=${customer.order_id}`,
          })
        );

        // Send the email using Medusa's notification system
        await medusaClient.notifications.send({
          to: customer.email,
          event_name: 'asset.updated',
          data: {
            customer,
            asset,
            email_template: emailHtml,
            subject: `Update Available: ${asset.title}`,
          },
        });

        console.log(`Asset update notification sent to ${customer.email}`);
      }
    } catch (error) {
      console.error('Error sending asset update notification:', error);
    }
  }

  /**
   * Send a general notification email
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email HTML content
   */
  static async sendEmail(to: string, subject: string, html: string) {
    try {
      await medusaClient.notifications.send({
        to,
        event_name: 'custom.email',
        data: {
          email_template: html,
          subject,
        },
      });

      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
