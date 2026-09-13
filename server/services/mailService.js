import nodemailer from 'nodemailer';

/**
 * Mail service. SMTP credentials come from environment variables only.
 * When SMTP is not configured the caller still succeeds: the contact message
 * is already persisted in MongoDB, the email is just a notification.
 */
export const isMailConfigured = () =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_TO);

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

/**
 * Notify the site owner about a new contact message.
 * @returns {Promise<boolean>} true when the notification was sent.
 */
export const sendContactNotification = async ({ name, email, subject, message }) => {
  if (!isMailConfigured()) return false;
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `Portfolio message: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html:
        '<h3>New portfolio message</h3>' +
        `<p><b>Name:</b> ${name}</p>` +
        `<p><b>Email:</b> ${email}</p>` +
        `<p><b>Subject:</b> ${subject}</p>` +
        `<p><b>Message:</b><br/>${String(message).replace(/\n/g, '<br/>')}</p>`,
    });
    return true;
  } catch (error) {
    console.warn(`Email notification failed: ${error.message}`);
    return false;
  }
};

export default { isMailConfigured, sendContactNotification };
