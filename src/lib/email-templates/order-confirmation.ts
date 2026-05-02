import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export function getOrderConfirmationHtml(order: Order, currency: string, siteUrl: string): string {
  const getAbsoluteUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const itemsList = order.items?.map(item => {
    const imageUrl = getAbsoluteUrl(item.image_url);
    return `
    <div style="border: 1px solid #1a1a1a; padding: 20px; margin-bottom: 16px; display: flex; align-items: flex-start;">
       ${imageUrl ? `
         <div style="width: 70px; margin-right: 20px;">
           <img src="${imageUrl}" alt="${item.title}" width="70" height="90" style="display: block; object-fit: cover; border: 1px solid #1a1a1a;" />
         </div>
       ` : ''}
       <div style="flex: 1;">
          <span style="display: block; font-size: 14px; color: #000; font-weight: 700; text-transform: uppercase;">${item.title}</span>
          ${item.properties && (item.properties.color || item.properties.size)
        ? `<span style="display: block; font-size: 12px; color: #1a1a1a; margin-top: 6px; font-weight: 600;">Color: ${item.properties.color || 'N/A'} | Size: ${item.properties.size || 'N/A'}</span>`
        : `<span style="display: block; font-size: 12px; color: #1a1a1a; margin-top: 6px; font-weight: 500;">${item.variant_title || ''}</span>`
      }
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
            <span style="font-size: 12px; color: #1a1a1a; font-weight: 600;">QTY: ${item.quantity}</span>
            <span style="font-size: 14px; color: #000; font-weight: 700;">${formatCurrency(item.unit_price, { code: currency, symbol: currency === 'PKR' ? 'Rs.' : '$', format: 'symbol amount' })}</span>
          </div>
       </div>
    </div>
  `}).join('') || '';

  // Note: We duplicate simple currency formatting logic or reuse the one from utils. 
  // Ideally, formatCurrency should take just the Order's currency code if simple, or the config object.
  // The 'currency' param passed here is likely just the code or symbol. 
  // Let's assume for this template we use the passed currency string to format or strict Utils call.
  // Only issue: formatCurrency in utils needs a config object. 
  // We'll construct a temp config object here to keep template pure-ish.

  const currencyConfig = { code: currency, symbol: currency === 'PKR' ? 'Rs.' : '$', format: 'symbol amount' as const };
  const fmt = (amount: number) => formatCurrency(amount, currencyConfig);

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border: 2px solid #1a1a1a;">
          <div style="text-align: center; padding: 40px; border-bottom: 2px solid #1a1a1a;">
             <h1 style="font-size: 28px; font-weight: 800; letter-spacing: 6px; text-transform: uppercase; margin: 0; color: #000;">SMPL</h1>
          </div>

          <div style="padding: 40px; border-bottom: 2px solid #1a1a1a;">
            <p style="font-size: 12px; color: #1a1a1a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Thank You For Your Order</p>
            <h2 style="font-size: 20px; font-weight: 800; color: #000; margin: 0; text-transform: uppercase;">#${order.order_number || order.id.slice(0, 8)}</h2>
          </div>

          <div style="padding: 40px; border-bottom: 2px solid #1a1a1a;">
            ${itemsList}
          </div>

          <div style="padding: 40px; border-bottom: 2px solid #1a1a1a;">
             <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; font-weight: 600;">
                <span style="text-transform: uppercase; letter-spacing: 1px;">Subtotal</span>
                <span style="color: #000;">${fmt(order.subtotal)}</span>
             </div>
             <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px; font-weight: 600;">
                <span style="text-transform: uppercase; letter-spacing: 1px;">Shipping</span>
                <span style="color: #000;">${fmt(order.shipping_total)}</span>
             </div>
             <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 16px; padding-top: 16px; border-top: 2px solid #1a1a1a; color: #000;">
                <span style="text-transform: uppercase; letter-spacing: 1px;">Total</span>
                <span>${fmt(order.total)}</span>
             </div>
          </div>

          <div style="padding: 40px; text-align: center;">
            <a href="${siteUrl}/account/orders/${order.id}" style="display: inline-block; background-color: #1a1a1a; color: #fff; padding: 16px 40px; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; font-weight: 800; border: 2px solid #1a1a1a;">View Order Status</a>
          </div>
        </div>
      </body>
    </html>
  `;
}
