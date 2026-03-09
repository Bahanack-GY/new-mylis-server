
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    private transporter = nodemailer.createTransport({
        host: 'ssl0.ovh.net',
        port: 465,
        secure: true, // SSL/TLS
        auth: {
            user: 'mychurch@lis.cm',
            pass: 'L1sm0negli5e',
        },
    });

    async sendNotification(to: string, title: string, body: string): Promise<void> {
        this.logger.log(`Sending email → ${to} | "${title}"`);
        try {
            await this.transporter.sendMail({
                from: '"MyLIS" <mychurch@lis.cm>',
                to,
                subject: title,
                html: this.buildTemplate(title, body),
                text: `${title}\n\n${body}`,
            });
            this.logger.log(`Email sent ✓ → ${to} | "${title}"`);
        } catch (err) {
            this.logger.error(`Email failed → ${to} | "${title}" | ${err?.message}`);
        }
    }

    private buildTemplate(title: string, body: string): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${this.esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#33cbcc 0%,#2bb5b6 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">MyLIS</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Workspace Notification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:18px;font-weight:600;">${this.esc(title)}</h2>
              <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">${this.esc(body).replace(/\n/g, '<br/>')}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                This is an automated message from <strong>MyLIS</strong>. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }

    private esc(str: string): string {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}
