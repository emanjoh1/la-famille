import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

        const { error } = await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        if (error) {
          console.error('Error updating booking on checkout complete:', error)
          return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 },
          )
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
