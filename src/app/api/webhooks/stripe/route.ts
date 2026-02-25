import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { clerkClient } from '@clerk/nextjs/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing STRIPE_WEBHOOK_SECRET' },
      { status: 500 },
    )
  }

  // Read raw body for signature verification
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe webhook verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 },
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.booking_id

        if (!bookingId) {
          console.error('No booking_id in checkout session metadata')
          return NextResponse.json(
            { error: 'Missing booking_id in metadata' },
            { status: 400 },
          )
        }

        const { data: booking, error } = await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)
          .select('*, listings(*)')
          .single()

        if (error || !booking) {
          console.error('Error updating booking on checkout complete:', error)
          return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 },
          )
        }

        // Send confirmation emails
        try {
          const listing = booking.listings as any
          const clerk = await clerkClient()
          const [guestUser, hostUser] = await Promise.all([
            clerk.users.getUser(booking.user_id),
            clerk.users.getUser(listing.user_id),
          ])

          const guestEmail = guestUser.emailAddresses[0]?.emailAddress
          const hostEmail = hostUser.emailAddresses[0]?.emailAddress
          const guestName = guestUser.firstName || 'Guest'
          const hostName = hostUser.firstName || 'Host'

          // Guest confirmation email
          if (guestEmail) {
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL!,
              to: guestEmail,
              subject: 'Booking Confirmed - La Famille',
              html: `
                <h2>Your booking is confirmed!</h2>
                <p>Hi ${guestName},</p>
                <p>Great news! Your payment was successful and your booking is confirmed.</p>
                <h3>Booking Details:</h3>
                <ul>
                  <li><strong>Property:</strong> ${listing.title}</li>
                  <li><strong>Location:</strong> ${listing.location}</li>
                  <li><strong>Check-in:</strong> ${new Date(booking.check_in).toLocaleDateString()}</li>
                  <li><strong>Check-out:</strong> ${new Date(booking.check_out).toLocaleDateString()}</li>
                  <li><strong>Guests:</strong> ${booking.guests}</li>
                  <li><strong>Total Paid:</strong> ${Number(booking.total_price).toLocaleString()} XAF</li>
                </ul>
                <p>View your booking: ${process.env.NEXT_PUBLIC_APP_URL}/bookings</p>
              `,
            })
          }

          // Host notification email
          if (hostEmail) {
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL!,
              to: hostEmail,
              subject: 'New Booking Received - La Famille',
              html: `
                <h2>You have a new booking!</h2>
                <p>Hi ${hostName},</p>
                <p>Good news! You have a new confirmed booking.</p>
                <h3>Booking Details:</h3>
                <ul>
                  <li><strong>Property:</strong> ${listing.title}</li>
                  <li><strong>Guest:</strong> ${guestName}</li>
                  <li><strong>Check-in:</strong> ${new Date(booking.check_in).toLocaleDateString()}</li>
                  <li><strong>Check-out:</strong> ${new Date(booking.check_out).toLocaleDateString()}</li>
                  <li><strong>Guests:</strong> ${booking.guests}</li>
                  <li><strong>Total:</strong> ${Number(booking.total_price).toLocaleString()} XAF</li>
                </ul>
                <p>Manage bookings: ${process.env.NEXT_PUBLIC_APP_URL}/host/bookings</p>
              `,
            })
          }
        } catch (emailError) {
          console.error('Email error:', emailError)
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata?.booking_id

        if (!bookingId) {
          // Payment intent may not always have booking metadata; log and skip
          console.warn('No booking_id in failed payment_intent metadata')
          break
        }

        const { error } = await supabaseAdmin
          .from('bookings')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        if (error) {
          console.error('Error updating booking on payment failure:', error)
          return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 },
          )
        }

        break
      }

      default:
        // Unhandled event type - acknowledge receipt
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('Stripe webhook handler error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
