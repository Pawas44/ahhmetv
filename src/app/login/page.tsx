'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Video, Chrome, MessageCircle, Github, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/chat');
    }
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified! You can now log in.');
    }
  }, [status, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Logged in successfully!');
        router.push('/chat');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    signIn(provider, { callbackUrl: '/chat' });
  };

  const oauthProviders = [
    { name: 'Google', icon: Chrome, color: 'hover:border-red-500/30', id: 'google' },
    { name: 'Discord', icon: MessageCircle, color: 'hover:border-indigo-500/30', id: 'discord' },
    { name: 'GitHub', icon: Github, color: 'hover:border-white/30', id: 'github' },
  ];

  return (
    <div className="glass-card">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
          <Video className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p className="text-sm text-muted">Sign in to start video chatting</p>
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {oauthProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleOAuth(provider.id)}
            className={`glass-hover flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${provider.color}`}
          >
            <provider.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{provider.name}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-muted-dark">or continue with email</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleLogin} className="space-y-4">
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

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-dark" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="glass-input w-full pl-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-dark hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-xs text-primary-light hover:text-primary transition-colors">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary-light hover:text-primary font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Suspense fallback={<div className="glass-card text-center py-20">Loading login...</div>}>
          <LoginFormContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
