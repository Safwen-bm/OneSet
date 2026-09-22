import { Injectable } from '@nestjs/common';
import { toDinars } from '@oneset/types';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

const CURRENCY = process.env.STRIPE_CURRENCY ?? 'usd';

/**
 * Wraps Stripe behind a feature flag so checkout works end-to-end with zero keys set.
 *
 * No STRIPE_SECRET_KEY  -> "stub" mode: a fake client secret, confirmed instantly by
 *                          OrdersService.confirmStubPayment(), no network call at all.
 * STRIPE_SECRET_KEY set -> real Stripe PaymentIntents, confirmed by the browser via
 *                          Stripe Elements. No code changes needed to switch — see README.
 */
@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe | null;
  readonly isLive: boolean;

  constructor(private readonly prisma: PrismaService) {
    const key = process.env.STRIPE_SECRET_KEY;
    this.isLive = Boolean(key);
    this.stripe = key ? new Stripe(key) : null;
  }

  async createIntent(orderId: string, amountMillimes: number) {
    if (this.stripe) {
      // Stripe settles in whole units of a supported currency. TND is 3-decimal and
      // isn't one Stripe settles in, so this converts to the configured settlement
      // currency (default USD) at parity for demo purposes — swap in a real FX rate,
      // or a TND-capable local provider, before this takes real payments.
      const amount = Math.round(toDinars(amountMillimes) * 100);
      const intent = await this.stripe.paymentIntents.create({
        amount,
        currency: CURRENCY,
        metadata: { orderId },
        automatic_payment_methods: { enabled: true },
      });
      await this.prisma.payment.create({
        data: {
          orderId,
          provider: 'stripe',
          providerRef: intent.id,
          amount: amountMillimes,
          status: 'REQUIRES_PAYMENT',
        },
      });
      return { clientSecret: intent.client_secret!, stub: false };
    }

    const stubSecret = `stub_secret_${orderId}`;
    await this.prisma.payment.create({
      data: {
        orderId,
        provider: 'stub',
        providerRef: stubSecret,
        amount: amountMillimes,
        status: 'REQUIRES_PAYMENT',
      },
    });
    return { clientSecret: stubSecret, stub: true };
  }

  /** For the real Stripe webhook, once STRIPE_WEBHOOK_SECRET is configured. */
  constructEvent(payload: Buffer, signature: string) {
    if (!this.stripe) throw new Error('Stripe is not configured.');
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set.');
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
