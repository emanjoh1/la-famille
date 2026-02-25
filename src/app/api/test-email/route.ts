import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: "emanjoh1@gmail.com",
      subject: "Test Email from La Famille",
      html: "<h1>Test successful!</h1><p>Your Resend integration is working.</p>",
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
