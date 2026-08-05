'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon, Bell, Lock, Shield, Trash2, ChevronRight, UserX
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    sounds: true,
    showOnlineStatus: true,
    showLastSeen: true,
    allowFriendRequests: true,
    allowMessages: true,
  });

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Account deleted successfully');
        await signOut({ callbackUrl: '/' });
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Failed to delete account');
    }
  };

  const settingsGroups = [
    {
      title: 'Appearance',
      icon: Moon,
      items: [
        { label: 'Dark Mode', key: 'darkMode', description: 'Use dark theme throughout the app' },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Push Notifications', key: 'notifications', description: 'Get notified about friend requests and messages' },
        { label: 'Sound Effects', key: 'sounds', description: 'Play sounds for matches and messages' },
      ],
    },
    {
      title: 'Privacy',
      icon: Lock,
      items: [
        { label: 'Show Online Status', key: 'showOnlineStatus', description: 'Let others see when you are online' },
        { label: 'Show Last Seen', key: 'showLastSeen', description: 'Display your last activity time' },
        { label: 'Allow Friend Requests', key: 'allowFriendRequests', description: 'Receive friend requests from strangers' },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted mb-8">Manage your preferences and account</p>

        <div className="space-y-6">
          {settingsGroups.map((group) => (
            <div key={group.title} className="glass-card">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <group.icon className="w-5 h-5 text-primary-light" /> {group.title}
              </h2>
              <div className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted">{item.description}</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${
                        settings[item.key as keyof typeof settings] ? 'bg-primary' : 'bg-muted-darker'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                        settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Blocked Users */}
          <div className="glass-card">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <UserX className="w-5 h-5 text-danger" /> Blocked Users
            </h2>
            <button onClick={() => toast.success('Cleared blocks list')} className="btn-secondary w-full flex items-center justify-between">
              <span>View blocked list</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Security */}
          <div className="glass-card">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-accent" /> Account Security
            </h2>
            <div className="space-y-3">
              <button onClick={() => toast.error('Check email to reset password')} className="btn-secondary w-full flex items-center justify-between">
                <span>Reset Password</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card border-danger/20">
            <h2 className="text-lg font-semibold text-danger flex items-center gap-2 mb-4">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </h2>
            {showDeleteConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-muted">Are you sure? This action cannot be undone. All your data will be permanently deleted.</p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteAccount} className="btn-danger flex-1">Yes, Delete My Account</button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger w-full">
                Delete Account
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
export const runtime = 'nodejs';
