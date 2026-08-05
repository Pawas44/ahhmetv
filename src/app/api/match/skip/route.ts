import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json().catch(() => ({}));
    const { callId } = body;

    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 });
    }

    const call = await prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call || call.status !== 'ACTIVE') {
      return NextResponse.json({ message: 'Call already ended or not found' });
    }

    const endedAt = new Date();
    const duration = Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000);

    await prisma.call.update({
      where: { id: callId },
      data: {
        status: 'COMPLETED',
        endedAt,
        duration,
      },
    });

    const otherUserId = call.callerId === userId ? call.calleeId : call.callerId;

    // Send skip trigger to partner
    await pusherServer.trigger(`private-user-${otherUserId}`, 'match:skipped', {
      callId,
      skippedBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Match skip error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
