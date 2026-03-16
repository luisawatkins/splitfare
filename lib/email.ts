import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react?: React.ReactElement | React.ReactNode;
  text?: string;
  from?: string;
}

export async function sendEmail({ to, subject, react, text, from }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured. Email will not be sent.');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'SplitFare <noreply@splitfare.io>',
      to: Array.isArray(to) ? to : [to],
      subject,
      react: react as any,
      text: text || '',
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
