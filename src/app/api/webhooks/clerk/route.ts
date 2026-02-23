import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!CLERK_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing CLERK_WEBHOOK_SECRET' },
      { status: 500 },
    )
  }

  // Retrieve headers for verification
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 },
    )
  }

  // Read the raw body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify the webhook signature
  const wh = new Webhook(CLERK_WEBHOOK_SECRET)
  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Clerk webhook verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 },
    )
  }

  const eventType = event.type

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } =
          event.data

        const primaryEmail = email_addresses?.[0]?.email_address

        const { error } = await supabaseAdmin.from('profiles').insert({
          id,
          email: primaryEmail,
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          avatar_url: image_url ?? null,
        })

        if (error) {
          console.error('Error inserting profile:', error)
          return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 },
          )
        }

        break
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } =
          event.data

        const primaryEmail = email_addresses?.[0]?.email_address

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            email: primaryEmail,
            first_name: first_name ?? null,
            last_name: last_name ?? null,
            avatar_url: image_url ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)

        if (error) {
          console.error('Error updating profile:', error)
          return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 },
          )
        }

        break
      }

      case 'user.deleted': {
        const { id } = event.data

        if (!id) {
          return NextResponse.json(
            { error: 'Missing user ID in deleted event' },
            { status: 400 },
          )
        }

        const { error } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting profile:', error)
          return NextResponse.json(
            { error: 'Failed to delete profile' },
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
    console.error('Clerk webhook handler error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
