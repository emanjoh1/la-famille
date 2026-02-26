import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, category, message } = await request.json();

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: "emanjoh1@gmail.com",
      replyTo: email,
      subject: `[${category.toUpperCase()}] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .info { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .label { font-weight: 600; color: #6b7280; }
            .message-box { background: #fff; padding: 20px; border-left: 4px solid #1E3A8A; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">New Support Request</h1>
            </div>
            <div class="content">
              <div class="info">
                <p><span class="label">From:</span> ${name}</p>
                <p><span class="label">Email:</span> ${email}</p>
                <p><span class="label">Category:</span> ${category}</p>
                <p><span class="label">Subject:</span> ${subject}</p>
              </div>
              
              <div class="message-box">
                <h3 style="margin-top: 0;">Message:</h3>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Support email sent:", result);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support email error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
