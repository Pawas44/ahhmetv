import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalUsers, onlineUsers, totalReports, pendingReports, totalCalls, premiumUsers, bannedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isOnline: true } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.call.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await prisma.user.count({ where: { createdAt: { gte: today } } });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersWeek = await prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });

    return NextResponse.json({
      stats: {
        totalUsers,
        onlineUsers,
        totalReports,
        pendingReports,
        totalCalls,
        premiumUsers,
        bannedUsers,
        newUsersToday,
        newUsersWeek,
      },
    });
  } catch (error: any) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
