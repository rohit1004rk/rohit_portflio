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
      // Your verified Gmail account remains the actual sender.
      from: `"Rohit Kumar | Portfolio" <${process.env.SMTP_USER}>`,

      // Notification will arrive here.
      to: process.env.MAIL_TO,

      // Reply button in Gmail will reply directly to the visitor.
      replyTo: email,

      // Visitor name is now clearly visible in the Gmail subject.
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

export default {
  isMailConfigured,
  sendContactNotification,
};
