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
  const mailer = await getTransporter();
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
  }

  return { messageId: info.messageId, previewUrl };
}
