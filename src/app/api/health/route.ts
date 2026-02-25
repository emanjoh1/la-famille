import { NextResponse } from 'next/server';
import { Resend } from 'resend';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}

export async function POST(req: Request) {
  try {
    const { listingId, title } = await req.json();

    if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
      console.error('Missing RESEND_API_KEY or ADMIN_EMAIL env var');
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const safeTitle = escapeHtml(String(title || ''));

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Listing Pending Review',
      html: `
        <h2>New listing submitted for review</h2>
        <p><strong>Title:</strong> ${safeTitle}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Review now</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
