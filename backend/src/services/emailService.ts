import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'HACCP Pro <noreply@haccppro.com>';
const APP_URL = process.env.APP_URL || 'https://haccp-system.vercel.app';

// ==========================================
// WELCOME EMAIL — sent when admin creates staff
// ==========================================
export async function sendWelcomeEmail({
    to,
    name,
    restaurantName,
    password,
}: {
    to: string;
    name: string;
    restaurantName: string;
    password: string;
}) {
    await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `You've been added to ${restaurantName} on HACCP Pro`,
        html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
            <div style="background: #1e293b; padding: 28px 32px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 22px; font-style: italic;">HACCP Pro</h1>
                <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Kitchen Compliance System</p>
            </div>
            <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <h2 style="margin: 0 0 8px; font-size: 18px;">Hi ${name},</h2>
                <p style="color: #64748b; margin: 0 0 24px;">You've been added to <strong>${restaurantName}</strong> on HACCP Pro. Here are your login credentials:</p>
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Login URL</p>
                    <p style="margin: 0 0 16px;"><a href="${APP_URL}/login" style="color: #3b82f6;">${APP_URL}/login</a></p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Email</p>
                    <p style="margin: 0 0 16px; font-weight: 600;">${to}</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Temporary Password</p>
                    <p style="margin: 0; font-weight: 700; font-size: 18px; letter-spacing: 0.05em; color: #1e293b;">${password}</p>
                </div>
                <p style="color: #ef4444; font-size: 13px; margin: 0;">Please change your password after logging in for the first time.</p>
            </div>
        </div>`,
    });
}

// ==========================================
// FORGOT PASSWORD EMAIL — reset link
// ==========================================
export async function sendPasswordResetEmail({
    to,
    name,
    token,
}: {
    to: string;
    name: string;
    token: string;
}) {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: 'Reset your HACCP Pro password',
        html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
            <div style="background: #1e293b; padding: 28px 32px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 22px; font-style: italic;">HACCP Pro</h1>
                <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Kitchen Compliance System</p>
            </div>
            <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <h2 style="margin: 0 0 8px; font-size: 18px;">Hi ${name},</h2>
                <p style="color: #64748b; margin: 0 0 24px;">We received a request to reset your password. Click the button below to set a new one. This link expires in <strong>1 hour</strong>.</p>
                <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: white; font-weight: 700; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-bottom: 24px;">Reset Password</a>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                <p style="color: #94a3b8; font-size: 11px; margin: 0; word-break: break-all;">Or copy this link: ${resetUrl}</p>
            </div>
        </div>`,
    });
}
