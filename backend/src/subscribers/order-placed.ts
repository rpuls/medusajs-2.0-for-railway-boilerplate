import { Modules } from '@medusajs/utils';
import { INotificationModuleService, IOrderModuleService } from '@medusajs/types';
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa';
import { backendUrl } from 'medusa-config';
import { OrderDTO, OrderAddressDTO } from '@medusajs/types/dist/order/common';

export default async function userInviteHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {

  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION);

  const orderModeulService: IOrderModuleService = container.resolve(Modules.ORDER);
  const order: OrderDTO = await orderModeulService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] });

  const shippingAdress: OrderAddressDTO = await (orderModeulService as any).orderAddressService_.retrieve(order.shipping_address.id);

  const emailTemplate = `
  <h1>Order Confirmation</h1>
  <p>Dear ${shippingAdress.first_name} ${shippingAdress.last_name},</p>
  <p>Thank you for your recent order! Here are your order details:</p>

  <h2>Order Summary</h2>
  <p><strong>Order ID:</strong> ${(order as any).display_id}</p>
  <p><strong>Order Date:</strong> ${order.created_at}</p>
  <p><strong>Total:</strong> ${(order as any).summary.raw_current_order_total.value} ${order.currency_code}</p>

  <h2>Shipping Address</h2>
  <p><strong>Name:</strong> ${shippingAdress.first_name} ${shippingAdress.last_name}</p>
  <p><strong>Address:</strong> ${shippingAdress.address_1}</p>
  <p><strong>City:</strong> ${shippingAdress.city}, ${shippingAdress.province} ${shippingAdress.postal_code}</p>
  <p><strong>Country:</strong> ${shippingAdress.country_code}</p>

  <h2>Order Items</h2>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Quantity</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map(item => `<tr>
          <td>${item.title} - ${item.product_title}</td>
          <td>${item.quantity}</td>
          <td>${item.unit_price} ${order.currency_code}</td>
        </tr>`).join('')}
    </tbody>
  </table>

  <p>You can view your order details <a href="${backendUrl}/admin/orders/${order.id}">here</a>.</p>

  <p>Sincerely,<br>The Medusa Team</p>
`;

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: emailTemplate, 
      data: { 
        subject: 'Your order has been placed'
      }
    });
  } catch (error) {
    console.error('Error sending order confirmation notification:', error);
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
};
