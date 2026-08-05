import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error('Stripe webhook verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || 'monthly';

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubscriptionId: subscription.id,
              plan,
              status: 'ACTIVE',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              stripeSubscriptionId: subscription.id,
              plan,
              status: 'ACTIVE',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { isPremium: true },
          });

          await prisma.payment.create({
            data: {
              userId,
              stripePaymentId: session.payment_intent || '',
              amount: session.amount_total || 0,
              currency: session.currency || 'usd',
              status: 'SUCCEEDED',
              description: `Premium subscription (${plan})`,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'EXPIRED' },
          });

          await prisma.user.update({
            where: { id: sub.userId },
            data: { isPremium: false },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const sub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: invoice.subscription },
          });

          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: 'PAST_DUE' },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
