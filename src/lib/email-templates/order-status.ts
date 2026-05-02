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
          <td style="padding: 16px 0; border-bottom: 2px solid #1a1a1a;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${imageUrl ? `<td style="width: 70px; vertical-align: top; padding-right: 16px;"><img src="${imageUrl}" alt="${item.title}" width="70" height="90" style="display: block; object-fit: cover; border: 1px solid #1a1a1a;" /></td>` : ''}
                <td style="vertical-align: top;">
                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #000; text-transform: uppercase;">${item.title}</p>
                  ${item.properties && (item.properties.color || item.properties.size)
        ? `<p style="margin: 6px 0 0 0; font-size: 12px; color: #1a1a1a; font-weight: 600;">Color: ${item.properties.color || 'N/A'} | Size: ${item.properties.size || 'N/A'}</p>`
        : `<p style="margin: 6px 0 0 0; font-size: 12px; color: #1a1a1a; font-weight: 500;">${item.variant_title || 'Standard'}</p>`
      }
                  <p style="margin: 6px 0 0 0; font-size: 12px; color: #1a1a1a; font-weight: 600;\">QTY: ${item.quantity}</p>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 16px 0; border-bottom: 2px solid #1a1a1a; text-align: right; vertical-align: top;\">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #000;\">${fmt(item.unit_price * item.quantity)}</p>
          </td>
        </tr>
      `;
  }).join('') || '';

  // Status uses outlined box style only
  const statusStyle = { bg: '#fff', text: '#1a1a1a', border: '#1a1a1a' };

  return `
        <!DOCTYPE html>
        <html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #1a1a1a;">
              
              <!-- Header -->
              <div style="background-color: #1a1a1a; padding: 32px 40px; text-align: center; border-bottom: 2px solid #1a1a1a;">
                <h1 style="font-size: 28px; font-weight: 800; letter-spacing: 6px; text-transform: uppercase; margin: 0; color: #fff;">SMPL</h1>
              </div>

              <!-- Status Badge -->
              <div style="padding: 40px 40px 0; text-align: center; border-bottom: 2px solid #1a1a1a;">
                <p style="font-size: 10px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0; font-weight: 700;">Order Status Update</p>
                <div style="display: inline-block; background-color: ${statusStyle.bg}; color: ${statusStyle.text}; border: 2px solid ${statusStyle.border}; padding: 12px 28px; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 40px;">
                  ${order.status}
                </div>
              </div>

              <!-- Order Info -->
              <div style="padding: 32px 40px; border-bottom: 2px solid #1a1a1a; text-align: center;">
                <p style="font-size: 13px; color: #1a1a1a; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Update for Order <strong style="color: #000; font-weight: 800;">#${order.order_number || order.id.slice(0, 8)}</strong>
                </p>
              </div>

              ${adminMessage ? `
                <!-- Admin Message -->
                <div style="margin: 0; background-color: #f9f9f9; border-bottom: 2px solid #1a1a1a; padding: 24px 40px;">
                  <p style="margin: 0; font-size: 13px; color: #1a1a1a; line-height: 1.6; font-weight: 500;">&quot;${adminMessage}&quot;</p>
                </div>
              ` : ''}\

              <!-- Products -->
              <div style="padding: 40px; border-bottom: 2px solid #1a1a1a;">
                <p style="font-size: 11px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px 0; font-weight: 700;">Your Items</p>
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsList}
                </table>
              </div>

              <!-- Order Summary -->
              <div style="padding: 40px; border-bottom: 2px solid #1a1a1a;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr>
                    <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Subtotal</td>
                    <td style="padding: 8px 0; text-align: right; color: #000; font-weight: 600;">${fmt(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Shipping</td>
                    <td style="padding: 8px 0; text-align: right; color: #000; font-weight: 600;">${fmt(order.shipping_total)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 0 0; color: #000; font-weight: 800; font-size: 16px; border-top: 2px solid #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">Total</td>
                    <td style="padding: 12px 0 0 0; text-align: right; color: #000; font-weight: 800; font-size: 16px; border-top: 2px solid #1a1a1a;">${fmt(order.total)}</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="padding: 40px; text-align: center; border-bottom: 2px solid #1a1a1a;">
                <a href="${siteUrl}/account/orders/${order.id}" style="display: inline-block; background-color: #1a1a1a; color: #fff; padding: 16px 40px; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; font-weight: 800; border: 2px solid #1a1a1a;">
                  View Order Details
                </a>
              </div>

              <!-- Footer -->
              <div style="padding: 24px 40px; background-color: #fff; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Questions? Reply to this email or contact our support team.
                </p>
                <p style="margin: 12px 0 0 0; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                  © ${new Date().getFullYear()} SMPL. All rights reserved.
                </p>
              </div>

            </div>
          </body>
        </html>
       `;
}
