'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Users, Crown, Settings, Shield, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { onlineCount } = useChatStore();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navLinks = [
    { href: '/chat', label: 'Start Chat', icon: Video },
    { href: '/friends', label: 'Friends', icon: Users },
  ];

  const isActive = (href: string) => pathname === href;
  const isAuthenticated = status === 'authenticated';
  const userObj = session?.user as any;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-purple group-hover:shadow-glow-purple transition-shadow duration-300">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">AHHHMETV</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(href)
                    ? 'bg-primary/20 text-primary-light border border-primary/30'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            
            <a 
              href="https://www.effectivecpmnetwork.com/bu840aau?key=61f9ed0316d96c291f520f342d244234" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/30 text-yellow-500 hover:from-yellow-400/30 hover:to-orange-500/30 transition-all duration-300 cursor-pointer"
              title="Get VIP Premium"
            >
              <Crown className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Get VIP</span>
            </a>

            {isAuthenticated && userObj ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold overflow-hidden">
                    {userObj.image ? (
                      <img src={userObj.image} alt="" className="w-8 h-8 object-cover" />
                    ) : (
                      userObj.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-medium">{userObj.name}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 glass rounded-2xl border border-white/10 py-2 shadow-xl"
                    >
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-semibold">{userObj.name}</p>
                        <p className="text-xs text-muted truncate">{userObj.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      {(userObj.role === 'ADMIN' || userObj.role === 'MODERATOR') && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 w-full text-left transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm">Log In</Link>
                <Link href="/register" className="btn-primary text-sm !px-4 !py-2">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1 bg-background">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(href) ? 'bg-primary/20 text-primary-light' : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
