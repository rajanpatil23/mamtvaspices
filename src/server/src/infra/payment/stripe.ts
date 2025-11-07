import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-03-31.basil",
  });
} else {
  console.warn("⚠️  STRIPE_SECRET_KEY not set — payment processing will not work.");
}

export default stripe;
