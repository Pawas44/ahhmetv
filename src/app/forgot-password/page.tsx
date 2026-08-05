'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setIsSent(true);
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Failed to send reset email link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
              {isSent ? <Check className="w-7 h-7 text-white" /> : <Mail className="w-7 h-7 text-white" />}
            </div>
            <h1 className="text-2xl font-bold mb-2">{isSent ? 'Check Your Email' : 'Forgot Password'}</h1>
            <p className="text-sm text-muted">
              {isSent ? 'If an account exists, we sent a password reset link.' : 'Enter your email address to receive a recovery link.'}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-dark" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="glass-input w-full pl-11"
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Sending...' : 'Send Recovery Link'}
              </button>
            </form>
          ) : null}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary-light hover:text-primary flex items-center gap-2 justify-center">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
export const runtime = 'nodejs';
