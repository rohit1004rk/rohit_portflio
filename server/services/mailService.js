import { Resend } from "resend";

/**
 * Mail service.
 *
 * Production email delivery uses Resend HTTPS API.
 * This avoids Render's outbound SMTP port restrictions.
 *
 * Required environment variables:
 *
 * RESEND_API_KEY=your_resend_api_key
 * RESEND_FROM=Rohit Kumar <your-verified-email@rohitportfolio.in>
 * MAIL_TO=your_email@gmail.com
 *
 * Contact messages are already saved in MongoDB before email is sent.
 * Therefore, email failure does not remove the message from Admin Panel.
 */

const getResendClient = () => {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
};

const getSenderAddress = () => {
  const sender = String(process.env.RESEND_FROM || "").trim();

  return sender || null;
};

/**
 * Check whether Resend email delivery is configured.
 *
 * We intentionally keep MAIL_TO because the Contact Us notification
 * must continue going to the portfolio owner's configured email.
 */
export const isMailConfigured = () =>
  Boolean(
    process.env.RESEND_API_KEY && getSenderAddress() && process.env.MAIL_TO,
  );

/**
 * Send an email through Resend.
 *
 * This is the common internal helper used by both:
 * - Contact Us notification
 * - Admin password reset
 */
const sendEmail = async ({ from, to, subject, text, html, replyTo }) => {
  const resend = getResendClient();

  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!from) {
    throw new Error("RESEND_FROM is not configured.");
  }

  if (!to) {
    throw new Error("Email recipient is not configured.");
  }

  const payload = {
    from,
    to: [to],
    subject,
    text,
    html,
  };

  if (replyTo) {
    payload.replyTo = replyTo;
  }

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(error.message || "Resend email delivery failed.");
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email ID.");
  }

  return data;
};

/**
 * Existing contact-form email notification.
 *
 * DO NOT remove this function because
 * messageController.js uses it.
 */
export const sendContactNotification = async ({
  name,
  email,
  subject,
  message,
}) => {
  if (!isMailConfigured()) {
    console.warn("Email notification skipped: Resend is not configured.");

    return false;
  }

  try {
    const sender = getSenderAddress();

    const result = await sendEmail({
      from: sender,
      to: process.env.MAIL_TO,

      replyTo: email,

      subject: `New Portfolio Message from ${name}`,

      text: `
NEW PORTFOLIO MESSAGE

Visitor Name: ${name}
Visitor Email: ${email}

Subject: ${subject}

Message:
${message}

--------------------------------
Reply directly to this email to respond to ${name}.
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2 style="margin-bottom: 20px;">
            New Portfolio Message
          </h2>

          <p>
            <strong>Visitor Name:</strong> ${name}
          </p>

          <p>
            <strong>Visitor Email:</strong>
            <a href="mailto:${email}">${email}</a>
          </p>

          <p>
            <strong>Subject:</strong> ${subject}
          </p>

          <div style="
            margin-top: 20px;
            padding: 16px;
            background: #f5f5f5;
            border-left: 4px solid #333;
          ">
            <strong>Message:</strong>

            <p style="white-space: pre-wrap; margin-bottom: 0;">
              ${String(message).replace(/\n/g, "<br />")}
            </p>
          </div>

          <p style="margin-top: 20px; color: #666;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    console.log(`✅ Resend contact notification sent. Email ID: ${result.id}`);

    return true;
  } catch (error) {
    console.warn(`Email notification failed: ${error.message}`);

    return false;
  }
};

/**
 * Admin password-reset email.
 *
 * The raw reset token is only placed inside the temporary reset URL.
 * It is never logged or stored by this mail service.
 */
export const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  if (!isMailConfigured()) {
    console.warn("Password reset email skipped: Resend is not configured.");

    return false;
  }

  try {
    const sender = getSenderAddress();

    const result = await sendEmail({
      from: sender,

      to: email,

      subject: "Reset Your Admin Password",

      text: `
A password reset request was received for your Admin account.

Reset Password:
${resetUrl}

This link is temporary and can only be used once.

If you did not request this reset, you can safely ignore this email.
      `.trim(),

      html: `
        <div style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #222;
          max-width: 620px;
          margin: 0 auto;
        ">
          <h2>Reset Your Admin Password</h2>

          <p>
            A password reset request was received for your Admin account.
          </p>

          <p style="margin: 28px 0;">
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 22px;
                background: #111827;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This link is temporary and can only be used once.
          </p>

          <p style="color: #666;">
            If you did not request this reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`✅ Resend password reset email sent. Email ID: ${result.id}`);

    return true;
  } catch (error) {
    console.warn(`Password reset email failed: ${error.message}`);

    return false;
  }
};

export default {
  isMailConfigured,
  sendContactNotification,
  sendPasswordResetEmail,
};
