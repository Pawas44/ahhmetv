'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard, Users, Flag, BarChart3, Ban, Megaphone,
  TrendingUp, UserPlus, Video, Crown, AlertCircle, Shield, ChevronRight, Eye
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { AdminStats, Report, Announcement } from '@/types';

export default function AdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = session?.user as any;

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats');
        const statsData = await statsRes.json();

        // Fallback checks for matching reports endpoints
        const reportsRes = await fetch('/api/admin/reports').catch(() => null);
        const reportsData = reportsRes ? await reportsRes.json() : { reports: [] };

        const announcementsRes = await fetch('/api/admin/announcements').catch(() => null);
        const announcementsData = announcementsRes ? await announcementsRes.json() : { announcements: [] };

        setStats(statsData.stats || null);
        setRecentReports((reportsData.reports || []).slice(0, 5));
        setAnnouncements(announcementsData.announcements || []);
      } catch (error) {
        console.error('Failed to load admin dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) {
      loadData();
    }
  }, [user]);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted">You do not have permissions to view this admin panel.</p>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-primary-light', change: `+${stats.newUsersToday} today` },
    { label: 'Online Now', value: stats.onlineUsers.toLocaleString(), icon: Eye, color: 'text-success', change: 'Live' },
    { label: 'Pending Reports', value: stats.pendingReports.toLocaleString(), icon: Flag, color: 'text-warning', change: `${stats.totalReports} total` },
    { label: 'Total Calls', value: stats.totalCalls.toLocaleString(), icon: Video, color: 'text-accent', change: '' },
    { label: 'Premium Users', value: stats.premiumUsers.toLocaleString(), icon: Crown, color: 'text-yellow-400', change: '' },
    { label: 'Banned Users', value: stats.bannedUsers.toLocaleString(), icon: Ban, color: 'text-danger', change: '' },
    { label: 'New This Week', value: stats.newUsersWeek.toLocaleString(), icon: UserPlus, color: 'text-neon-cyan', change: '' },
    { label: 'New Today', value: stats.newUsersToday.toLocaleString(), icon: TrendingUp, color: 'text-success', change: '' },
  ] : [];

  const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, active: true },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/reports', label: 'Reports', icon: Flag },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 p-4 hidden lg:block">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-light" /> Admin Panel
        </h2>
        <nav className="space-y-1">
          {sidebarLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                link.active ? 'bg-primary/20 text-primary-light' : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon className="w-4 h-4" /> {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Stats Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted mb-8">Overview of your platform metrics</p>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card !p-4 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      {stat.change && <span className="text-xs text-muted">{stat.change}</span>}
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Flag className="w-5 h-5 text-warning" /> Recent Reports
                    </h2>
                    <Link href="/admin/reports" className="text-sm text-primary-light hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  {recentReports.length === 0 ? (
                    <p className="text-sm text-muted text-center py-6">No pending reports 🎉</p>
                  ) : (
                    <div className="space-y-3">
                      {recentReports.map(report => (
                        <div key={report.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
                          <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{report.reported.username}</p>
                            <p className="text-xs text-muted">{report.reason.replace('_', ' ')}</p>
                          </div>
                          <span className="text-xs text-muted">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-accent" /> Announcements
                    </h2>
                  </div>
                  {announcements.length === 0 ? (
                    <p className="text-sm text-muted text-center py-6">No active announcements</p>
                  ) : (
                    <div className="space-y-3">
                      {announcements.slice(0, 3).map(ann => (
                        <div key={ann.id} className="p-3 rounded-xl bg-white/[0.02]">
                          <p className="text-sm font-medium">{ann.title}</p>
                          <p className="text-xs text-muted mt-1">{ann.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
export const runtime = 'nodejs';
