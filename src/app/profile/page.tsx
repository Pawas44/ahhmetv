'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, Globe, Heart, Camera, Shield, Crown, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { countries } from '@/lib/countries';
import CountrySelect from '@/components/ui/CountrySelect';



export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    age: '',
    gender: '',
    country: '',
    languages: '',
    interests: '',
  });

  const user = session?.user as any;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/users/me');
        const data = await res.json();
        if (res.ok && data.user) {
          setForm({
            displayName: data.user.displayName || '',
            bio: data.user.bio || '',
            age: data.user.age?.toString() || '',
            gender: data.user.gender || '',
            country: data.user.country || '',
            languages: data.user.languages?.join(', ') || '',
            interests: data.user.interests?.join(', ') || '',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName,
          bio: form.bio,
          age: form.age ? parseInt(form.age) : null,
          gender: form.gender || null,
          country: form.country || null,
          languages: form.languages ? form.languages.split(',').map(l => l.trim()).filter(Boolean) : [],
          interests: form.interests ? form.interests.split(',').map(i => i.trim()).filter(Boolean) : [],
        }),
      });

      if (!res.ok) throw new Error('Failed to update');

      const data = await res.json();
      await update({
        name: data.user.displayName || data.user.username,
      });

      setIsEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save profile changes');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="text-center py-20">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Card */}
        <div className="glass-card mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center text-3xl font-bold overflow-hidden shadow-glow-purple">
                {user.image ? (
                  <img src={user.image} alt="" className="w-24 h-24 object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <button className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.isPremium && <span className="badge-premium"><Crown className="w-3 h-3" /> Premium</span>}
                {user.isVerified && <span className="badge-verified"><Shield className="w-3 h-3" /> Verified</span>}
              </div>
              <p className="text-muted mt-1">{user.email}</p>
            </div>

            <button onClick={() => setIsEditing(!isEditing)} className={isEditing ? 'btn-danger' : 'btn-secondary'}>
              {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><User className="w-4 h-4" /> Edit Profile</>}
            </button>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5 text-primary-light" /> About</h2>
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs text-muted mb-1 block">Display Name</label>
                  <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="glass-input w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="glass-input w-full h-24 resize-none" maxLength={500} />
                </div>
              </>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted">Bio</span><span>{form.bio || 'Not set'}</span></div>
                <div className="flex justify-between"><span className="text-muted">Age</span><span>{form.age || 'Not set'}</span></div>
              </div>
            )}
          </div>

          <div className="glass-card space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Globe className="w-5 h-5 text-accent" /> Location & Language</h2>
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs text-muted mb-1 block">Country</label>
                  <CountrySelect 
                    value={form.country} 
                    onChange={(val) => setForm({ ...form, country: val })} 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Languages (comma separated)</label>
                  <input type="text" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="glass-input w-full" />
                </div>
              </>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Country</span>
                  <span className="flex items-center gap-2">
                    {form.country ? (() => {
                      const c = countries.find(x => x.code === form.country);
                      return c ? (
                        <>
                          <img 
                            src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} 
                            alt={c.name}
                            className="w-4 h-auto rounded-sm shadow-sm"
                          />
                          {c.name}
                        </>
                      ) : form.country;
                    })() : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-muted">Languages</span><span>{form.languages || 'Not set'}</span></div>
              </div>
            )}
          </div>

          <div className="glass-card space-y-4 md:col-span-2">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Heart className="w-5 h-5 text-neon-pink" /> Interests</h2>
            {isEditing ? (
              <div>
                <input type="text" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="gaming, music, coding..." className="glass-input w-full" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {form.interests ? form.interests.split(',').map((interest, i) => (
                  <span key={i} className="px-3 py-1 rounded-full glass text-sm capitalize">{interest.trim()}</span>
                )) : <span className="text-sm text-muted">No interests added yet</span>}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} disabled={isLoading} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
export const runtime = 'nodejs';
