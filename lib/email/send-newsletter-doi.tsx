import { render } from '@react-email/render';
import NewsletterDoiEmail, { type NewsletterDoiProps } from '@/emails/NewsletterDoiEmail';
import { emailFrom, emailReplyTo, getResend } from './client';

export async function sendNewsletterDoi(to: string, props: NewsletterDoiProps): Promise<void> {
  const resend = getResend();
  const html = await render(<NewsletterDoiEmail {...props} />);
  const text = await render(<NewsletterDoiEmail {...props} />, { plainText: true });
  const replyTo = emailReplyTo();
  const { error } = await resend.emails.send({
    from: emailFrom(),
    to,
    subject: `Bitte bestätige deine Newsletter-Anmeldung bei ${props.siteName}`,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}
