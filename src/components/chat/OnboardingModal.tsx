'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import CountrySelect from '@/components/ui/CountrySelect';
import { countries } from '@/lib/countries';



export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const user = session?.user as any;
  
  const [form, setForm] = useState({
    displayName: user?.name || '',
    age: '',
    gender: '',
    country: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.age || parseInt(form.age) < 18) {
      toast.error('You must be at least 18 years old to use this service.');
      return;
    }
    if (!form.gender) {
      toast.error('Please select a gender.');
      return;
    }
    if (!form.country) {
      toast.error('Please select a country.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName,
          age: parseInt(form.age),
          gender: form.gender,
          country: form.country,
        }),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      // Update local session
      await update({
        name: form.displayName,
        age: parseInt(form.age),
        gender: form.gender,
        country: form.country,
      });

      toast.success('Welcome to AHHHMETV!');
      onClose();
    } catch {
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md border-primary/20 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary"></div>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-sm text-muted">Let others know a bit about you before chatting.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1 block">Display Name</label>
            <input 
              type="text" 
              required
              value={form.displayName} 
              onChange={(e) => setForm({ ...form, displayName: e.target.value })} 
              className="glass-input w-full" 
              placeholder="What should we call you?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted mb-1 block">Age</label>
              <input 
                type="number" 
                required
                min="18"
                max="99"
                value={form.age} 
                onChange={(e) => setForm({ ...form, age: e.target.value })} 
                className="glass-input w-full" 
                placeholder="18+"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Gender</label>
              <select 
                required
                value={form.gender} 
                onChange={(e) => setForm({ ...form, gender: e.target.value })} 
                className="glass-input w-full appearance-none bg-[#0a0a1a] text-white [&>option]:bg-[#12122a] [&>option]:text-white"
              >
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="NON_BINARY">Non-Binary</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Country
            </label>
            <CountrySelect 
              value={form.country} 
              onChange={(val) => setForm({ ...form, country: val })} 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="btn-primary w-full mt-4 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
              </span>
            ) : (
              <><Save className="w-4 h-4" /> Start Chatting</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
