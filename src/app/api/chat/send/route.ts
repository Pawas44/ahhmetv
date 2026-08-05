import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { moderateContent } from '@/services/moderation';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, type, receiverId, callId } = await req.json();

    if (!content || !receiverId) {
      return NextResponse.json({ error: 'Message content and receiver are required' }, { status: 400 });
    }

    const senderId = (session.user as any).id;
    const senderName = session.user.name || 'User';

    // Moderate text content
    const moderation = moderateContent(content);
    if (!moderation.allowed) {
      return NextResponse.json({
        error: 'Message blocked by moderation policy.',
        blocked: true,
        reasons: moderation.reasons,
      }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        type: type || 'text',
        callId: callId || null,
      },
    });

    const pusherPayload = {
      id: message.id,
      senderId,
      senderName,
      content,
      type: message.type,
      timestamp: message.createdAt.getTime(),
    };

    // Dispatch message event
    if (callId) {
      await pusherServer.trigger(`private-call-${callId}`, 'chat:message', pusherPayload);
    } else {
      await pusherServer.trigger(`private-user-${receiverId}`, 'chat:message', pusherPayload);
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Send message API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
