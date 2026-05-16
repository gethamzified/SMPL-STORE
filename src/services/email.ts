import transporter, { getFromAddress } from '@/lib/nodemailer';
import { Order } from '@/lib/types';
import { StoreConfigService } from './config';
import { getOtpEmailHtml } from '@/lib/email-templates/otp';
import { getOrderConfirmationHtml } from '@/lib/email-templates/order-confirmation';
import { getOrderUpdateHtml } from '@/lib/email-templates/order-status';

export const EmailService = {
  async sendOTP(email: string, otp: string) {
    try {
      if (!process.env.SMTP_USER) {
        console.warn('SMTP_USER not set. Logging OTP:', otp);
        return; // Dev mode fallback
      }

      await transporter.sendMail({
        from: getFromAddress('SMPL Support'),
        to: email,
        subject: 'Secure Sign-in Code',
        html: getOtpEmailHtml(otp),
      });
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw error;
    }
  },

  async sendOrderConfirmation(email: string, order: Order) {
    try {
      if (!process.env.SMTP_USER) return;
      
      // Use Raw config to avoid Next.js cache Invariant errors in background workers
      const config = await StoreConfigService.getRawStoreConfig();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      await transporter.sendMail({
        from: getFromAddress('SMPL Support'),
        to: email,
        subject: `Order Confirmation #${order.id.slice(0, 8)}`,
        html: getOrderConfirmationHtml(order, config.currency.code, siteUrl),
      });
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      throw error; // Throw so BullMQ can catch and retry
    }
  },

  async sendOrderStatusUpdate(email: string, order: Order, adminMessage?: string) {
    try {
      if (!process.env.SMTP_USER) return;

      const config = await StoreConfigService.getRawStoreConfig();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      await transporter.sendMail({
        from: getFromAddress('SMPL Support'),
        to: email,
        subject: `Order Update: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)} - #${order.order_number || order.id.slice(0, 8)}`,
        html: getOrderUpdateHtml(order, config.currency.code, siteUrl, adminMessage),
      });
    } catch (error) {
      console.error('Failed to send status update email:', error);
      throw error; // Throw so BullMQ can catch and retry
    }
  }
};
