import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, type, signal } = await req.json();

    if (!to || !type || !signal) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const senderId = (session.user as any).id;

    // Relay the WebRTC signaling data
    await pusherServer.trigger(`private-user-${to}`, `signal:${type}`, {
      from: senderId,
      signal,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Signaling error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
