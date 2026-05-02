export function getOtpEmailHtml(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 2px solid #1a1a1a;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 28px; font-weight: 800; letter-spacing: 6px; text-transform: uppercase; margin: 0; color: #000;">SMPL</h1>
          </div>
          
          <p style="font-size: 13px; color: #1a1a1a; margin-bottom: 32px; line-height: 1.8; font-weight: 500;">
            You requested a secure sign-in code for your SMPL account. Use the code below to complete your login.
          </p>

          <div style="background-color: #1a1a1a; color: #fff; padding: 24px; text-align: center; font-size: 36px; letter-spacing: 10px; font-family: monospace; margin-bottom: 32px; border: 2px solid #1a1a1a; font-weight: 800;">
            ${otp}
          </div>

          <p style="font-size: 10px; color: #1a1a1a; text-align: center; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
            This code expires in 10 minutes. If you did not request this access, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
}
