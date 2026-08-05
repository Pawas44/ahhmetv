'use client';

import { motion } from 'framer-motion';
import { Crown, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      'Random video matching',
      'Text chat',
      'Basic filters',
      'Friend system',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    description: 'Unlock the full AHHHMETV experience',
    features: [
      'Everything in Free',
      'Unlimited filters',
      'Priority matching',
      'Custom backgrounds',
      'Premium badge',
      'Ad-free experience',
    ],
    cta: 'Get Premium',
    popular: true,
    plan: 'monthly',
  },
  {
    name: 'Premium Annual',
    price: '$79.99',
    period: '/year',
    description: 'Save 33% with annual billing',
    features: [
      'Everything in Premium',
      'Save $39.89/year',
      'Exclusive badge',
    ],
    cta: 'Get Annual',
    popular: false,
    plan: 'yearly',
  },
];

export default function PremiumPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const handleCheckout = async (plan: string) => {
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Payment gateway not available');
      }
    } catch {
      toast.error('Failed to initiate checkout process');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-primary-light mb-4">
          <Crown className="w-4 h-4" /> Upgrade Your Experience
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Go <span className="gradient-text">Premium</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Unlock unlimited matching filters, priority connections, and exclusive badges.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative glass-card flex flex-col ${plan.popular ? 'border-primary/40 shadow-glow-purple scale-[1.02]' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-primary text-xs font-semibold">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted mb-4">{plan.description}</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold gradient-text">{plan.price}</span>
                <span className="text-muted text-sm mb-1">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span className="text-muted">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.plan ? (
              <button
                onClick={() => handleCheckout(plan.plan!)}
                disabled={user?.isPremium}
                className={plan.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}
              >
                {user?.isPremium ? 'Active' : plan.cta}
              </button>
            ) : (
              <button disabled className="btn-secondary w-full opacity-50">
                {plan.cta}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export const runtime = 'nodejs';
