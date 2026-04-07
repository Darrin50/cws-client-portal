import { Resend } from "resend";
import { ReactNode } from "react";

// Lazy initialization to prevent build-time failures when RESEND_API_KEY is not set
let _resend: Resend | undefined;
const getResend = () => {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
};

export async function sendEmail(
  to: string,
  subject: string,
  react: ReactNode
) {
  try {
    const result = await getResend().emails.send({
      from: process.env.EMAIL_FROM || "noreply@cwsportal.com",
      to,
      subject,
      react: react || <div>{subject}</div>,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return null;
    }

    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}

export async function sendEmailBatch(
  emails: Array<{
    to: string;
    subject: string;
    react: ReactNode;
  }>
) {
  try {
    const results = await Promise.all(
      emails.map((email) =>
        sendEmail(email.to, email.subject, email.react)
      )
    );

    return results;
  } catch (error) {
    console.error("Error sending batch emails:", error);
    return null;
  }
}
