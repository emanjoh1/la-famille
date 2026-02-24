import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}

export async function POST(req: Request) {
  try {
    const { listingId, title } = await req.json();
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.ADMIN_EMAIL!,
      subject: 'New Listing Pending Review',
      html: `
        <h2>New listing submitted for review</h2>
        <p><strong>Title:</strong> ${title}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Review now</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
