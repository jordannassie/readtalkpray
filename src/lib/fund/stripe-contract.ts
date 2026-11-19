import type { DonationFrequency } from "./donation";

/**
 * Developer note — connecting the /fund form to Stripe
 *
 * The giving form is a preview. It does not create charges, Checkout Sessions,
 * customers, or subscriptions, and it does not collect cardholder data or
 * save donor contact details.
 *
 * When the receiving legal entity is confirmed and Stripe credentials exist
 * in Netlify, connect this UI without redesigning it:
 *
 * 1. Install the official `stripe` package for server code only.
 * 2. Add these Netlify environment variables. Do not commit them.
 *    - STRIPE_SECRET_KEY
 *    - STRIPE_WEBHOOK_SECRET
 *    Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY only if you use the Payment
 *    Element. Prefer hosted Stripe Checkout first.
 * 3. Add a server route that accepts FutureCheckoutRequest. Validate the
 *    amount again on the server: integer cents, at least 500, and no
 *    floating-point dollar math. Create a Checkout Session with
 *    unit_amount set to those cents.
 *    - frequency "once" uses mode "payment"
 *    - frequency "monthly" uses mode "subscription"
 * 4. Send the browser to the session URL returned by Stripe. Add public
 *    success and cancellation pages that only explain the Checkout result.
 *    Let Stripe send donor receipts.
 * 5. Add a webhook route that verifies the Stripe signature, records the
 *    event id, and skips events that were already processed.
 * 6. Enable the give button only after that server route exists. Until
 *    then it stays disabled. Keep card number, expiration, and CVC fields
 *    out of this app. Collect card details only inside Stripe Checkout or
 *    the Payment Element.
 * 7. Confirm the nonprofit or business entity, tax disclosure, and how
 *    gifts are described before calling a gift tax deductible. Do not turn
 *    on payments until that configuration is real.
 *
 * This file is the integration contract. It does not call Stripe.
 */
export type FutureCheckoutRequest = {
  amountCents: number;
  frequency: DonationFrequency;
};

export type FutureCheckoutSession = {
  url: string;
};

export const STRIPE_INTEGRATION = {
  ready: false,
  checkout: "stripe-hosted-checkout",
  oneTimeMode: "payment",
  monthlyMode: "subscription",
  amountUnit: "integer-cents",
  receipts: "stripe",
  environment: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
} as const;
