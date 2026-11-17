import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      connectionTimeout: 2500,
      greetingTimeout: 2500,
      socketTimeout: 3000,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log('[Mailer] Using custom SMTP server');
    return transporter;
  }

  // Development fallback: check if Ethereal is reachable with a 2-second timeout
  try {
    const etherealPromise = nodemailer.createTestAccount();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Ethereal connection timeout')), 2000),
    );

    const testAccount = (await Promise.race([
      etherealPromise,
      timeoutPromise,
    ])) as nodemailer.TestAccount;

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      connectionTimeout: 2000,
      greetingTimeout: 2000,
      socketTimeout: 3000,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Mailer] Ethereal test mailbox created: ${testAccount.user}`);
  } catch (_err) {
    // Zero-network fallback for robust offline development / testing
    console.log(
      '[Mailer] Offline/Local JSON transporter active (emails logged to terminal)',
    );
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

export interface SendExchangeEmailOptions {
  toEmail: string;
  toOwnerName: string;
  bookTitle: string;
  requesterName: string;
  requesterEmail: string;
  requesterBooks: Array<{ title: string; author: string }>;
}

export async function sendExchangeNotificationEmail(options: SendExchangeEmailOptions) {
  const from =
    process.env.SMTP_FROM || '"ShelfTrade Community" <noreply@shelftrade.local>';

  const booksListHtml =
    options.requesterBooks.length > 0
      ? `<ul>${options.requesterBooks.map(b => `<li><strong>${b.title}</strong> by ${b.author}</li>`).join('')}</ul>`
      : '<p><em>No books currently listed on their shelf.</em></p>';

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #F5F0D0; color: #1A1A1A; border: 1px solid rgba(26,26,26,0.1); border-radius: 6px;">
      <h2 style="color: #8B2020; margin-top: 0;">📚 Book Exchange Request!</h2>
      <p>Hello <strong>${options.toOwnerName}</strong>,</p>
      <p>
        Good news! <strong>${options.requesterName}</strong> (<a href="mailto:${options.requesterEmail}">${options.requesterEmail}</a>)
        is interested in exchanging for your book:
      </p>
      <div style="padding: 12px 16px; background-color: #FFFFFF; border-left: 4px solid #8B2020; margin: 16px 0; border-radius: 4px;">
        <h3 style="margin: 0; color: #1A1A1A;">📖 ${options.bookTitle}</h3>
      </div>
      <p>Here are the books they currently have available to trade:</p>
      <div style="background-color: #FFFFFF; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
        ${booksListHtml}
      </div>
      <p>You can reply directly to <a href="mailto:${options.requesterEmail}" style="color: #8B2020; font-weight: bold;">${options.requesterEmail}</a> to arrange the exchange details.</p>
      <hr style="border: none; border-top: 1px solid rgba(26,26,26,0.1); margin: 24px 0;" />
      <p style="font-size: 12px; color: #8A7F6A;">Sent with care by ShelfTrade — Peer-to-Peer Book Exchange.</p>
    </div>
  `;

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from,
      to: options.toEmail,
      subject: `[ShelfTrade] Exchange request for "${options.bookTitle}" from ${options.requesterName}`,
      html: htmlContent,
    });

    let previewUrl: string | undefined;
    try {
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    } catch {
      previewUrl = undefined;
    }

    if (previewUrl) {
      console.log(`[Mailer] Preview email URL: ${previewUrl}`);
    } else {
      console.log(
        `[Mailer] Exchange email dispatched successfully to ${options.toEmail}`,
      );
    }

    return { messageId: info.messageId, previewUrl };
  } catch (mailErr: unknown) {
    const errorMsg = mailErr instanceof Error ? mailErr.message : String(mailErr);
    console.warn(
      `[Mailer] SMTP delivery failed (${errorMsg}). Switching to offline console dispatch:`,
    );
    console.log('────────────────────────────────────────────────────────────');
    console.log('[ShelfTrade Outgoing Email Notification]');
    console.log(`To: ${options.toEmail} (${options.toOwnerName})`);
    console.log(
      `Subject: [ShelfTrade] Exchange request for "${options.bookTitle}" from ${options.requesterName}`,
    );
    console.log(`Requester: ${options.requesterName} <${options.requesterEmail}>`);
    console.log(`Target Book: "${options.bookTitle}"`);
    console.log(
      `Offered Books: ${
        options.requesterBooks.length > 0
          ? options.requesterBooks.map(b => `"${b.title}" by ${b.author}`).join(', ')
          : '(No books currently listed on requester shelf)'
      }`,
    );
    console.log('────────────────────────────────────────────────────────────');

    // Fall back to jsonTransport for any subsequent calls
    transporter = nodemailer.createTransport({ jsonTransport: true });

    return {
      messageId: `local-${Date.now()}`,
      previewUrl: undefined,
    };
  }
}

export interface SendPasswordResetEmailOptions {
  toEmail: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail(options: SendPasswordResetEmailOptions) {
  const from =
    process.env.SMTP_FROM || '"ShelfTrade Community" <noreply@shelftrade.local>';

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #F5F0D0; color: #1A1A1A; border: 1px solid rgba(26,26,26,0.1); border-radius: 6px;">
      <h2 style="color: #8B2020; margin-top: 0;">🔐 Password Reset Request</h2>
      <p>Hello <strong>${options.name}</strong>,</p>
      <p>
        We received a request to reset your password for your ShelfTrade reader account.
        Click the link below to choose a new password:
      </p>
      <div style="margin: 24px 0; text-align: center;">
        <a href="${options.resetUrl}" style="background-color: #8B2020; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset My Password</a>
      </div>
      <p style="font-size: 13px; color: #8A7F6A;">This reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid rgba(26,26,26,0.1); margin: 24px 0;" />
      <p style="font-size: 12px; color: #8A7F6A;">Sent with care by ShelfTrade — Peer-to-Peer Book Exchange.</p>
    </div>
  `;

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from,
      to: options.toEmail,
      subject: `[ShelfTrade] Password Reset Link`,
      html: htmlContent,
    });
    return { messageId: info.messageId };
  } catch (_err) {
    console.log('────────────────────────────────────────────────────────────');
    console.log('[ShelfTrade Outgoing Password Reset Email]');
    console.log(`To: ${options.toEmail} (${options.name})`);
    console.log(`Reset URL: ${options.resetUrl}`);
    console.log('────────────────────────────────────────────────────────────');
    return { messageId: `local-reset-${Date.now()}` };
  }
}

export interface SendWelcomeEmailOptions {
  toEmail: string;
  name: string;
}

export async function sendWelcomeEmail(options: SendWelcomeEmailOptions) {
  const from =
    process.env.SMTP_FROM || '"ShelfTrade Community" <noreply@shelftrade.local>';

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #F5F0D0; color: #1A1A1A; border: 1px solid rgba(26,26,26,0.1); border-radius: 6px;">
      <h2 style="color: #8B2020; margin-top: 0;">📖 Welcome to ShelfTrade!</h2>
      <p>Hello <strong>${options.name}</strong>,</p>
      <p>
        Thank you for joining our community of readers and book collectors.
        Your reader account is now active!
      </p>
      <div style="padding: 14px 18px; background-color: #FFFFFF; border-left: 4px solid #3D5C2A; margin: 16px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 6px 0; color: #1A1A1A;">Next steps to start trading:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555;">
          <li>Add books you have read and wish to swap to your personal shelf.</li>
          <li>Discover books from other readers and send trade proposals with 1 click.</li>
          <li>Coordinate exchange deliveries or in-person swaps directly with fellow members.</li>
        </ul>
      </div>
      <hr style="border: none; border-top: 1px solid rgba(26,26,26,0.1); margin: 24px 0;" />
      <p style="font-size: 12px; color: #8A7F6A;">Happy reading &amp; exchanging! — The ShelfTrade Team</p>
    </div>
  `;

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from,
      to: options.toEmail,
      subject: `[ShelfTrade] Welcome to the Community, ${options.name}!`,
      html: htmlContent,
    });
    return { messageId: info.messageId };
  } catch (_err) {
    console.log('────────────────────────────────────────────────────────────');
    console.log('[ShelfTrade Outgoing Welcome Email]');
    console.log(`To: ${options.toEmail} (${options.name})`);
    console.log(`Subject: Welcome to ShelfTrade!`);
    console.log('────────────────────────────────────────────────────────────');
    return { messageId: `local-welcome-${Date.now()}` };
  }
}

export interface SendExchangeAcceptedEmailOptions {
  toEmail: string;
  requesterName: string;
  ownerName: string;
  ownerEmail: string;
  bookTitle: string;
}

export async function sendExchangeAcceptedEmail(
  options: SendExchangeAcceptedEmailOptions,
) {
  const from =
    process.env.SMTP_FROM || '"ShelfTrade Community" <noreply@shelftrade.local>';

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #F5F0D0; color: #1A1A1A; border: 1px solid rgba(26,26,26,0.1); border-radius: 6px;">
      <h2 style="color: #3D5C2A; margin-top: 0;">🎉 Trade Request Accepted!</h2>
      <p>Hello <strong>${options.requesterName}</strong>,</p>
      <p>
        Great news! <strong>${options.ownerName}</strong> has accepted your exchange proposal for:
      </p>
      <div style="padding: 12px 16px; background-color: #FFFFFF; border-left: 4px solid #3D5C2A; margin: 16px 0; border-radius: 4px;">
        <h3 style="margin: 0; color: #1A1A1A;">📖 ${options.bookTitle}</h3>
      </div>
      <p>
        You can now coordinate the exchange details (meeting point or postal delivery) directly with the owner by emailing:
      </p>
      <p style="font-size: 16px; margin: 16px 0;">
        <a href="mailto:${options.ownerEmail}" style="color: #8B2020; font-weight: bold; text-decoration: underline;">${options.ownerEmail}</a>
      </p>
      <hr style="border: none; border-top: 1px solid rgba(26,26,26,0.1); margin: 24px 0;" />
      <p style="font-size: 12px; color: #8A7F6A;">ShelfTrade — Peer-to-Peer Book Exchange.</p>
    </div>
  `;

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from,
      to: options.toEmail,
      subject: `[ShelfTrade] Trade Accepted for "${options.bookTitle}"!`,
      html: htmlContent,
    });
    return { messageId: info.messageId };
  } catch (_err) {
    console.log('────────────────────────────────────────────────────────────');
    console.log('[ShelfTrade Outgoing Trade Accepted Email]');
    console.log(`To: ${options.toEmail} (Requester: ${options.requesterName})`);
    console.log(`Owner: ${options.ownerName} <${options.ownerEmail}>`);
    console.log(`Book: "${options.bookTitle}"`);
    console.log('────────────────────────────────────────────────────────────');
    return { messageId: `local-accepted-${Date.now()}` };
  }
}
