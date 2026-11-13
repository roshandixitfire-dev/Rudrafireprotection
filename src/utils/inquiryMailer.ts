import nodemailer from 'nodemailer';

export interface LeadInquiryEmailData {
    leadId: number;
    srNo: string;
    salesFormNo: string;
    salesFormDate: string;
    company: string;
    name: string;
    phone: string;
    location: string;
    service: string;
    notes: string;
}

export interface EmailDispatchResult {
    sent: boolean;
    provider?: 'resend' | 'gmail-smtp' | 'custom-smtp';
    error?: string;
}

const DEFAULT_NOTIFY_EMAIL = 'roshandixitfire@gmail.com';

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeWhatsAppDigits(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
}

function buildEmailContent(data: LeadInquiryEmailData) {
    const subject = `New CRM Inquiry (${data.salesFormNo}): ${data.company} — ${data.service}`;
    const safeCompany = escapeHtml(data.company);
    const safeName = escapeHtml(data.name || 'Not specified');
    const safePhone = escapeHtml(data.phone);
    const safeLocation = escapeHtml(data.location || 'Mumbai / MMR');
    const safeService = escapeHtml(data.service);
    const safeNotes = escapeHtml(data.notes || 'None provided').replace(/\n/g, '<br/>');
    const safeRef = escapeHtml(data.salesFormNo);
    const safeDate = escapeHtml(data.salesFormDate);
    const waDigits = normalizeWhatsAppDigits(data.phone);
    const telHref = `tel:${data.phone.replace(/[^\d+]/g, '')}`;

    const text = [
        `NEW WEBSITE INQUIRY LOGGED IN RUDRA CRM`,
        `========================================`,
        `CRM Reference : ${data.salesFormNo} (Sr. No: ${data.srNo})`,
        `Date          : ${data.salesFormDate}`,
        `Company/Soc.  : ${data.company}`,
        `Contact Name  : ${data.name || 'Not specified'}`,
        `Phone         : ${data.phone}`,
        `Location      : ${data.location || 'Mumbai / MMR'}`,
        `Requirement   : ${data.service}`,
        `Notes         : ${data.notes || 'None provided'}`,
        ``,
        `Source        : Website Fast Quotation (/landing)`,
        `CRM Stage     : NEW | Priority: HOT`,
    ].join('\n');

    const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;background-color:#f8fafc;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#0f172a;padding:20px 24px;border-bottom:4px solid #E3242B;">
              <div style="font-size:11px;font-weight:bold;letter-spacing:1.5px;color:#fca5a5;text-transform:uppercase;">
                Rudra Fire Protection — CRM Lead Alert
              </div>
              <div style="font-size:20px;font-weight:800;color:#ffffff;margin-top:4px;">
                New Website Quotation Inquiry
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <div style="display:inline-block;padding:6px 12px;background-color:#fef2f2;border:1px solid #fecaca;border-radius:4px;color:#b91c1c;font-size:12px;font-weight:700;margin-bottom:18px;">
                CRM Ref: ${safeRef} &nbsp;|&nbsp; Date: ${safeDate} &nbsp;|&nbsp; Stage: NEW (HOT)
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;width:160px;font-weight:600;">Company / Society</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;">${safeCompany}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Contact Person</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Phone Number</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;">
                    <a href="${telHref}" style="color:#E3242B;text-decoration:none;">${safePhone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Site Location</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${safeLocation}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;">Required Service</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;">${safeService}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;vertical-align:top;">Project Notes</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;line-height:1.5;">${safeNotes}</td>
                </tr>
              </table>

              <div style="margin-top:22px;">
                <a href="${telHref}" style="display:inline-block;padding:10px 16px;background-color:#E3242B;color:#ffffff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:700;margin-right:8px;">
                  Call Client
                </a>
                ${
                    waDigits
                        ? `<a href="https://wa.me/${waDigits}" style="display:inline-block;padding:10px 16px;background-color:#25D366;color:#ffffff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:700;">WhatsApp Client</a>`
                        : ''
                }
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f1f5f9;padding:14px 24px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;">
              Logged automatically into Supabase CRM (<code>leads</code>) from <strong>/landing</strong> Fast Quotation Form.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    return { subject, text, html };
}

export async function sendLeadInquiryEmail(
    data: LeadInquiryEmailData
): Promise<EmailDispatchResult> {
    const toEmail = (process.env.INQUIRY_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL).trim();
    const { subject, text, html } = buildEmailContent(data);

    // 1. Prefer Resend HTTPS API if configured
    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (resendKey) {
        try {
            const fromEmail =
                process.env.RESEND_FROM_EMAIL?.trim() || 'Rudra CRM <onboarding@resend.dev>';
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${resendKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [toEmail],
                    subject,
                    text,
                    html,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                return {
                    sent: false,
                    provider: 'resend',
                    error: `Resend API error (${response.status}): ${errText}`,
                };
            }
            return { sent: true, provider: 'resend' };
        } catch (err: unknown) {
            return {
                sent: false,
                provider: 'resend',
                error: err instanceof Error ? err.message : 'Resend request failed',
            };
        }
    }

    // 2. Gmail SMTP via App Password
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
    if (gmailAppPassword) {
        try {
            const gmailUser = (process.env.GMAIL_USER || DEFAULT_NOTIFY_EMAIL).trim();
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: gmailUser,
                    pass: gmailAppPassword,
                },
            });

            await transporter.sendMail({
                from: `"Rudra Fire Protection CRM" <${gmailUser}>`,
                to: toEmail,
                subject,
                text,
                html,
            });

            return { sent: true, provider: 'gmail-smtp' };
        } catch (err: unknown) {
            return {
                sent: false,
                provider: 'gmail-smtp',
                error: err instanceof Error ? err.message : 'Gmail SMTP send failed',
            };
        }
    }

    // 3. Generic SMTP server
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS;
    if (smtpHost && smtpUser && smtpPass) {
        try {
            const smtpPort = Number(process.env.SMTP_PORT || 587);
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });

            await transporter.sendMail({
                from: process.env.SMTP_FROM?.trim() || `"Rudra Fire Protection CRM" <${smtpUser}>`,
                to: toEmail,
                subject,
                text,
                html,
            });

            return { sent: true, provider: 'custom-smtp' };
        } catch (err: unknown) {
            return {
                sent: false,
                provider: 'custom-smtp',
                error: err instanceof Error ? err.message : 'SMTP send failed',
            };
        }
    }

    return {
        sent: false,
        error: 'Email credentials not configured (set GMAIL_APP_PASSWORD or RESEND_API_KEY in .env.local).',
    };
}

