import { Resend } from "resend";
import { ReactNode } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  react: ReactNode
) {
  try {
    const result = await resend.emails.send({
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
