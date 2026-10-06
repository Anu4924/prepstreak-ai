import nodemailer from "nodemailer";

/**
 * PrepStreak AI Server-Side Email Delivery Service
 *
 * Implements real-world email dispatch using:
 * 1. Resend API (via RESEND_API_KEY or EMAIL_PROVIDER_API_KEY)
 * 2. Standard SMTP Transport (via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * 3. SendGrid API (via SENDGRID_API_KEY)
 *
 * Credentials are read exclusively on the server and are never exposed to the client.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendOtpEmailParams {
  to: string;
  fullName: string;
  otp: string;
}

export interface SendPasswordResetParams {
  to: string;
  fullName: string;
  resetCode: string;
}

export interface EmailConfigStatus {
  configured: boolean;
  provider?: "resend" | "sendgrid" | "smtp";
  missingEnvVars: string[];
}

export interface EmailDeliveryResult {
  success: boolean;
  provider: "resend" | "sendgrid" | "smtp" | "none";
  messageId?: string;
  error?: string;
  isConfigurationError?: boolean;
}

function getSenderAddress(): string {
  const envFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM;
  if (envFrom && envFrom.trim()) {
    const cleaned = envFrom.trim().replace(/^["']|["']$/g, "").trim();
    if (cleaned) {
      return cleaned;
    }
  }
  return "PrepStreak AI <onboarding@resend.dev>";
}

function getResendApiKey(): string | null {
  const rawKey =
    process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
  if (!rawKey) return null;
  const cleaned = rawKey.trim().replace(/^["']|["']$/g, "").trim();
  if (
    !cleaned ||
    cleaned.startsWith("your_") ||
    cleaned === "re_xxxxxxxxxxxx"
  ) {
    return null;
  }
  return cleaned;
}

export const EmailService = {
  /**
   * Inspects server environment to verify if a valid email delivery provider is configured.
   */
  checkConfiguration(): EmailConfigStatus {
    const resendApiKey = getResendApiKey();
    if (resendApiKey) {
      return { configured: true, provider: "resend", missingEnvVars: [] };
    }

    const sendgridApiKey = process.env.SENDGRID_API_KEY?.trim().replace(/^["']|["']$/g, "");
    if (sendgridApiKey && !sendgridApiKey.startsWith("your_")) {
      return { configured: true, provider: "sendgrid", missingEnvVars: [] };
    }

    const smtpHost = process.env.SMTP_HOST?.trim().replace(/^["']|["']$/g, "");
    const smtpUser = process.env.SMTP_USER?.trim().replace(/^["']|["']$/g, "");
    const smtpPass = process.env.SMTP_PASS?.trim().replace(/^["']|["']$/g, "");
    if (
      smtpHost &&
      smtpUser &&
      smtpPass &&
      smtpHost.trim() &&
      smtpUser.trim() &&
      smtpPass.trim()
    ) {
      return { configured: true, provider: "smtp", missingEnvVars: [] };
    }

    return {
      configured: false,
      missingEnvVars: [
        "RESEND_API_KEY (Recommended: get your API key from https://resend.com/api-keys)",
        "OR SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (e.g. Gmail App Password or AWS SES)",
        "OR SENDGRID_API_KEY (SendGrid)",
      ],
    };
  },

  /**
   * Internal generic email sender that selects the available email provider
   */
  async sendEmail(params: SendEmailParams): Promise<EmailDeliveryResult> {
    const { to, subject, html, text } = params;
    const from = getSenderAddress();
    const configStatus = this.checkConfiguration();

    // 1. If NO provider is configured, fail clearly without pretending success
    if (!configStatus.configured) {
      const errorMsg =
        "Email delivery provider is not configured. Real verification codes cannot be sent until you configure RESEND_API_KEY (recommended: https://resend.com) or SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) in .env.local.";

      console.error("==================================================");
      console.error("[PrepStreak AI Email Service — Configuration Error]");
      console.error(`Cannot deliver email to: ${to}`);
      console.error("Reason: No server-side email delivery provider is configured.");
      console.error("Required variables in .env.local:");
      console.error("  Option 1 (Resend - Recommended):");
      console.error("    RESEND_API_KEY=re_xxxxxxxxxxxx");
      console.error("    EMAIL_FROM='PrepStreak AI <onboarding@resend.dev>'");
      console.error("  Option 2 (SMTP - Gmail App Password / AWS SES / Mailgun):");
      console.error("    SMTP_HOST=smtp.gmail.com");
      console.error("    SMTP_PORT=587");
      console.error("    SMTP_SECURE=false");
      console.error("    SMTP_USER=your-email@gmail.com");
      console.error("    SMTP_PASS=your-16-character-app-password");
      console.error("    EMAIL_FROM='PrepStreak AI <your-email@gmail.com>'");
      console.error("  Option 3 (SendGrid):");
      console.error("    SENDGRID_API_KEY=SG.xxxxxxxxxxxx");
      console.error("==================================================");

      return {
        success: false,
        provider: "none",
        isConfigurationError: true,
        error: errorMsg,
      };
    }

    // 2. Resend REST API (Standard, fast, edge/node compatible)
    if (configStatus.provider === "resend") {
      const resendApiKey = getResendApiKey()!;

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [to],
            subject,
            html,
            text,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          console.log(
            `[EmailService] Real OTP email successfully delivered via Resend to ${to} (Message ID: ${data?.id || "ok"})`
          );
          return {
            success: true,
            provider: "resend",
            messageId: data?.id,
          };
        }

        const resendError =
          data?.message || data?.error || `HTTP ${response.status}`;
        console.error(
          `[EmailService Error] Resend API rejected message to ${to}:`,
          resendError
        );

        let userFriendlyError = `Resend email delivery failed: ${resendError}`;
        if (response.status === 401) {
          userFriendlyError =
            "Invalid Resend API key. Please check your RESEND_API_KEY in .env.local.";
        } else if (
          response.status === 403 &&
          typeof data?.message === "string" &&
          data.message.includes("testing emails")
        ) {
          userFriendlyError = data.message;
        }

        return {
          success: false,
          provider: "resend",
          isConfigurationError: response.status === 401,
          error: userFriendlyError,
        };
      } catch (resendError) {
        const msg =
          resendError instanceof Error
            ? resendError.message
            : "Network error contacting Resend API";
        console.error(
          `[EmailService Error] Failed to contact Resend API for ${to}:`,
          msg
        );
        return {
          success: false,
          provider: "resend",
          error: `Failed to connect to Resend email service: ${msg}`,
        };
      }
    }

    // 3. SMTP Transport (e.g. Gmail SMTP, Amazon SES SMTP, Custom SMTP)
    if (configStatus.provider === "smtp") {
      const smtpHost = process.env.SMTP_HOST!.trim();
      const smtpUser = process.env.SMTP_USER!.trim();
      const smtpPass = process.env.SMTP_PASS!.trim();
      const smtpPort = Number(process.env.SMTP_PORT) || 587;
      const smtpSecure =
        process.env.SMTP_SECURE === "true" || smtpPort === 465;

      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const info = await transporter.sendMail({
          from,
          to,
          subject,
          html,
          text,
        });

        console.log(
          `[EmailService] Real OTP email successfully delivered via SMTP to ${to} (Message ID: ${info.messageId})`
        );
        return {
          success: true,
          provider: "smtp",
          messageId: info.messageId,
        };
      } catch (smtpError) {
        const msg =
          smtpError instanceof Error ? smtpError.message : "SMTP transport error";
        console.error(
          `[EmailService Error] SMTP transporter failed for ${to}:`,
          msg
        );
        return {
          success: false,
          provider: "smtp",
          error: `SMTP email delivery failed: ${msg}. Please check your SMTP credentials.`,
        };
      }
    }

    // 4. SendGrid REST API
    if (configStatus.provider === "sendgrid") {
      const sendgridApiKey = process.env.SENDGRID_API_KEY!.trim();
      try {
        const fromEmail = from.includes("<")
          ? from.split("<")[1].replace(">", "").trim()
          : from.trim();

        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sendgridApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: fromEmail },
            subject,
            content: [
              { type: "text/plain", value: text || subject },
              { type: "text/html", value: html },
            ],
          }),
        });

        if (response.ok || response.status === 202) {
          console.log(
            `[EmailService] Real OTP email successfully delivered via SendGrid to ${to}`
          );
          return {
            success: true,
            provider: "sendgrid",
          };
        }

        const errText = await response.text();
        console.error(
          `[EmailService Error] SendGrid rejected message to ${to}:`,
          errText
        );
        return {
          success: false,
          provider: "sendgrid",
          error: `SendGrid email delivery failed: ${errText || "Request rejected"}`,
        };
      } catch (sgError) {
        const msg =
          sgError instanceof Error
            ? sgError.message
            : "Network error contacting SendGrid API";
        console.error(
          `[EmailService Error] Failed to contact SendGrid for ${to}:`,
          msg
        );
        return {
          success: false,
          provider: "sendgrid",
          error: `Failed to connect to SendGrid: ${msg}`,
        };
      }
    }

    return {
      success: false,
      provider: "none",
      isConfigurationError: true,
      error: "No email provider configured.",
    };
  },

  /**
   * Generates and dispatches a branded verification OTP email.
   * Exactly matches required text:
   * PrepStreak AI
   * Email Verification
   * Your verification code is: [OTP]
   * This code expires in a few minutes.
   * Do not share this code with anyone.
   * Do not expose the OTP anywhere else in the application.
   */
  async sendOtpEmail(params: SendOtpEmailParams): Promise<EmailDeliveryResult> {
    const { to, fullName, otp } = params;
    const subject = `PrepStreak AI — Email Verification: ${otp}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PrepStreak AI — Email Verification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9f7; margin: 0; padding: 40px 16px; color: #1e2923;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e1e7e3; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(12, 46, 31, 0.06);">
    <!-- Header -->
    <tr>
      <td style="padding: 28px 32px; background: #0c2e1f; text-align: center;">
        <div style="color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: 0.5px;">PrepStreak AI</div>
        <div style="color: #ecd5b3; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 1.5px;">Email Verification</div>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 36px 32px;">
        <h1 style="font-size: 20px; font-weight: 800; color: #0c2e1f; margin: 0 0 12px; line-height: 1.3;">Email Verification</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4a5c52; margin: 0 0 16px;">
          Hello <strong>${fullName || "Aspirant"}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #4a5c52; margin: 0 0 20px;">
          Your verification code is:
        </p>

        <!-- OTP Display Box -->
        <div style="text-align: center; margin: 24px 0; padding: 24px; background: #f3f6f4; border: 2px dashed #0c2e1f; border-radius: 16px;">
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0c2e1f; font-family: 'Courier New', Courier, monospace;">
            ${otp}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #728479; text-transform: uppercase; margin-top: 8px;">
            Single-Use Verification Code
          </div>
        </div>

        <p style="font-size: 14px; font-weight: 600; color: #0c2e1f; margin: 0 0 10px;">
          This code expires in a few minutes.
        </p>
        <p style="font-size: 13px; font-weight: 600; color: #b91c1c; margin: 0 0 20px;">
          Do not share this code with anyone.
        </p>
        <p style="font-size: 12px; color: #8a9c92; margin: 0; line-height: 1.5;">
          If you did not request this verification code, please ignore this email.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background: #fbfdfb; border-top: 1px solid #eef2ef; text-align: center; font-size: 11px; color: #728479;">
        © 2026 PrepStreak AI • Focused Competitive Exam Platform
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `PrepStreak AI\nEmail Verification\n\nYour verification code is: ${otp}\n\nThis code expires in a few minutes.\n\nDo not share this code with anyone.\n\n© 2026 PrepStreak AI`;

    return this.sendEmail({ to, subject, html, text });
  },

  /**
   * Generates and dispatches a password reset code email.
   */
  async sendPasswordResetEmail(
    params: SendPasswordResetParams
  ): Promise<EmailDeliveryResult> {
    const { to, fullName, resetCode } = params;
    const subject = `PrepStreak AI — Password Reset Code: ${resetCode}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PrepStreak AI — Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9f7; margin: 0; padding: 40px 16px; color: #1e2923;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e1e7e3; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(12, 46, 31, 0.06);">
    <tr>
      <td style="padding: 28px 32px; background: #0c2e1f; text-align: center;">
        <div style="color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: 0.5px;">PrepStreak AI</div>
        <div style="color: #ecd5b3; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 1.5px;">Account Security</div>
      </td>
    </tr>
    <tr>
      <td style="padding: 36px 32px;">
        <h1 style="font-size: 20px; font-weight: 800; color: #0c2e1f; margin: 0 0 12px;">Password Reset Request</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4a5c52; margin: 0 0 16px;">
          Hello <strong>${fullName || "Aspirant"}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #4a5c52; margin: 0 0 20px;">
          Your password reset code is:
        </p>

        <div style="text-align: center; margin: 24px 0; padding: 24px; background: #f3f6f4; border: 2px dashed #0c2e1f; border-radius: 16px;">
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0c2e1f; font-family: 'Courier New', Courier, monospace;">
            ${resetCode}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #728479; text-transform: uppercase; margin-top: 8px;">
            Single-Use Password Reset Code
          </div>
        </div>

        <p style="font-size: 14px; font-weight: 600; color: #0c2e1f; margin: 0 0 10px;">
          This code expires in a few minutes.
        </p>
        <p style="font-size: 13px; font-weight: 600; color: #b91c1c; margin: 0 0 20px;">
          Do not share this code with anyone.
        </p>
        <p style="font-size: 12px; color: #8a9c92; margin: 0; line-height: 1.5;">
          If you did not request a password reset, you can safely disregard this message.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background: #fbfdfb; border-top: 1px solid #eef2ef; text-align: center; font-size: 11px; color: #728479;">
        © 2026 PrepStreak AI • Focused Competitive Exam Platform
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `PrepStreak AI\nPassword Reset\n\nYour reset code is: ${resetCode}\n\nThis code expires in a few minutes.\n\nDo not share this code with anyone.\n\n© 2026 PrepStreak AI`;

    return this.sendEmail({ to, subject, html, text });
  },
};
