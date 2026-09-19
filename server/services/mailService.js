import nodemailer from "nodemailer";

/**
 * Mail service.
 * SMTP credentials come from environment variables only.
 *
 * Contact message is already saved in MongoDB before email is sent.
 * Therefore, email failure does not remove the message from Admin Panel.
 */
export const isMailConfigured = () =>
  Boolean(
    process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_TO,
  );

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/**
 * Existing contact-form email notification.
 * DO NOT remove this function because messageController.js uses it.
 */
export const sendContactNotification = async ({
  name,
  email,
  subject,
  message,
}) => {
  if (!isMailConfigured()) {
    console.warn("Email notification skipped: SMTP is not configured.");
    return false;
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Rohit Kumar | Portfolio" <${process.env.SMTP_USER}>`,
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

    console.log(`✅ Gmail notification sent for message from ${name}`);

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
    console.warn("Password reset email skipped: SMTP is not configured.");
    return false;
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Rohit Kumar | Admin Security" <${process.env.SMTP_USER}>`,
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

    console.log(`✅ Password reset email sent to ${email}`);

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
