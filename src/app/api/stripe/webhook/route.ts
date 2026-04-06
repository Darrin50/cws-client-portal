import { NextRequest, NextResponse } from 'next/server';

const secret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!secret) {
    return NextResponse.json(
      { error: 'Stripe webhook secret not configured' },
      { status: 500 }
    );
  }

  // TODO: Verify Stripe signature
  // const signature = request.headers.get('stripe-signature');
  // if (!signature) {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  // }

  try {
    const body = await request.text();
    const event = JSON.parse(body);

    // TODO: Verify signature with Stripe
    // const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {
      case 'invoice.paid':
        // TODO: Update subscription status
        console.log('Invoice paid:', event.data.object);
        break;

      case 'invoice.payment_failed':
        // TODO: Handle payment failure
        console.log('Invoice payment failed:', event.data.object);
        break;

      case 'customer.subscription.created':
        // TODO: Create subscription in database
        console.log('Subscription created:', event.data.object);
        break;

      case 'customer.subscription.updated':
        // TODO: Update subscription in database
        console.log('Subscription updated:', event.data.object);
        break;

      case 'customer.subscription.deleted':
        // TODO: Cancel subscription in database
        console.log('Subscription deleted:', event.data.object);
        break;

      default:
        console.log('Unhandled Stripe event:', event.type);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
