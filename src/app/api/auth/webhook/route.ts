import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

const secret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // TODO: Verify Svix signature
  // const signature = request.headers.get('svix-signature');
  // if (!signature) {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  // }

  try {
    const body = await request.text();

    // TODO: Verify signature with Svix
    // const wh = new Webhook(secret);
    // const evt = wh.verify(body, {
    //   'svix-id': request.headers.get('svix-id') || '',
    //   'svix-timestamp': request.headers.get('svix-timestamp') || '',
    //   'svix-signature': signature,
    // });

    const evt = JSON.parse(body);

    switch (evt.type) {
      case 'user.created':
        // TODO: Create user in database
        console.log('User created:', evt.data);
        break;

      case 'user.updated':
        // TODO: Update user in database
        console.log('User updated:', evt.data);
        break;

      case 'organization.created':
        // TODO: Create organization in database
        console.log('Organization created:', evt.data);
        break;

      case 'organizationMembership.created':
        // TODO: Add member to organization
        console.log('Organization membership created:', evt.data);
        break;

      case 'organizationMembership.deleted':
        // TODO: Remove member from organization
        console.log('Organization membership deleted:', evt.data);
        break;

      case 'session.created':
        // TODO: Track session
        console.log('Session created:', evt.data);
        break;

      default:
        console.log('Unhandled webhook event:', evt.type);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
