export function getOtpEmailHtml(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #eaeaea;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #000;">SMPL</h1>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 24px; line-height: 1.6;">
            You requested a secure sign-in code for your SMPL account. Use the code below to complete your login.
          </p>

          <div style="background-color: #000; color: #fff; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-family: monospace; margin-bottom: 30px;">
            ${otp}
          </div>

          <p style="font-size: 11px; color: #999; text-align: center; margin-top: 40px;">
            This code expires in 10 minutes. If you did not request this access, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
}
