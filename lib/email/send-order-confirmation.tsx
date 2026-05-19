import { render } from '@react-email/render';
import OrderConfirmationEmail, {
  type OrderConfirmationProps,
} from '@/emails/OrderConfirmationEmail';
import { emailFrom, emailReplyTo, getResend } from './client';

export async function sendOrderConfirmation(
  to: string,
  props: OrderConfirmationProps,
): Promise<void> {
  const resend = getResend();
  const html = await render(<OrderConfirmationEmail {...props} />);
  const text = await render(<OrderConfirmationEmail {...props} />, { plainText: true });

  const replyTo = emailReplyTo();
  const { error } = await resend.emails.send({
    from: emailFrom(),
    to,
    subject: `Deine Bestellung ${props.orderNumber} bei ${props.siteName}`,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
    headers: {
      'X-Entity-Ref-ID': props.orderNumber,
    },
  });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}
