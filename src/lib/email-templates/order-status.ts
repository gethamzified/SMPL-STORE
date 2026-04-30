import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export function getOrderUpdateHtml(order: Order, currency: string, siteUrl: string, adminMessage?: string): string {
  const getAbsoluteUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const currencyConfig = { code: currency, symbol: currency === 'PKR' ? 'Rs.' : '$', format: 'symbol amount' as const };
  const fmt = (amount: number) => formatCurrency(amount, currencyConfig);

  // Build items list with product details
  const itemsList = order.items?.map(item => {
    const imageUrl = getAbsoluteUrl(item.image_url);
    return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #eee;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${imageUrl ? `<td style="width: 60px; vertical-align: top; padding-right: 16px;"><img src="${imageUrl}" alt="${item.title}" width="60" height="75" style="display: block; object-fit: cover; border: 1px solid #eee;" /></td>` : ''}
                <td style="vertical-align: top;">
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000;">${item.title}</p>
                  ${item.properties && (item.properties.color || item.properties.size)
        ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">Color: ${item.properties.color || 'N/A'} | Size: ${item.properties.size || 'N/A'}</p>`
        : `<p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${item.variant_title || 'Standard'}</p>`
      }
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #999;">Qty: ${item.quantity}</p>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 16px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
            <p style="margin: 0; font-size: 14px; font-weight: 500; color: #000;">${fmt(item.unit_price * item.quantity)}</p>
          </td>
        </tr>
      `;
  }).join('') || '';

  // Status-specific styling
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    processing: { bg: '#DBEAFE', text: '#1E40AF', border: '#60A5FA' },
    shipped: { bg: '#D1FAE5', text: '#065F46', border: '#34D399' },
    delivered: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B', border: '#F87171' },
    refunded: { bg: '#E5E7EB', text: '#374151', border: '#9CA3AF' },
  };
  const statusStyle = statusColors[order.status] || statusColors.pending;

  return `
        <!DOCTYPE html>
        <html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <div style="background-color: #000; padding: 30px; text-align: center;">
                <h1 style="font-size: 20px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #fff;">SMPL</h1>
              </div>

              <!-- Status Badge -->
              <div style="padding: 40px 40px 30px; text-align: center;">
                <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Order Status Update</p>
                <div style="display: inline-block; background-color: ${statusStyle.bg}; color: ${statusStyle.text}; border: 1px solid ${statusStyle.border}; padding: 10px 24px; border-radius: 50px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  ${order.status}
                </div>
              </div>

              <!-- Order Info -->
              <div style="padding: 0 40px 30px; text-align: center;">
                <p style="font-size: 14px; color: #666; margin: 0;">
                  Update for Order <strong style="color: #000;">#${order.order_number || order.id.slice(0, 8)}</strong>
                </p>
              </div>

              ${adminMessage ? `
                <!-- Admin Message -->
                <div style="margin: 0 40px 30px; background-color: #f9fafb; border-left: 4px solid #000; padding: 16px 20px;">
                  <p style="margin: 0; font-size: 13px; color: #374151; font-style: italic; line-height: 1.6;">"${adminMessage}"</p>
                </div>
              ` : ''}

              <!-- Products -->
              <div style="padding: 0 40px;">
                <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; border-bottom: 2px solid #000; padding-bottom: 8px;">Your Items</p>
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsList}
                </table>
              </div>

              <!-- Order Summary -->
              <div style="padding: 30px 40px; background-color: #fafafa; margin-top: 30px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #666;">Subtotal</td>
                    <td style="padding: 6px 0; text-align: right; color: #000;">${fmt(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #666;">Shipping</td>
                    <td style="padding: 6px 0; text-align: right; color: #000;">${fmt(order.shipping_total)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 6px 0; color: #000; font-weight: 700; font-size: 16px; border-top: 2px solid #000;">Total</td>
                    <td style="padding: 12px 0 6px 0; text-align: right; color: #000; font-weight: 700; font-size: 16px; border-top: 2px solid #000;">${fmt(order.total)}</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="padding: 40px; text-align: center;">
                <a href="${siteUrl}/account/orders/${order.id}" style="display: inline-block; background-color: #000; color: #fff; padding: 16px 40px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; border-radius: 4px;">
                  View Order Details
                </a>
              </div>

              <!-- Footer -->
              <div style="padding: 30px 40px; background-color: #f5f5f5; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 12px; color: #999;">
                  Questions? Reply to this email or contact our support team.
                </p>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #ccc;">
                  © ${new Date().getFullYear()} SMPL. All rights reserved.
                </p>
              </div>

            </div>
          </body>
        </html>
       `;
}
