import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { requestId, status } = await req.json(); // ACCEPTED or REJECTED

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.receiverId !== userId) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (status === 'ACCEPTED') {
      await prisma.$transaction([
        prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: 'ACCEPTED' },
        }),
        prisma.friendship.create({
          data: {
            userAId: request.senderId,
            userBId: request.receiverId,
          },
        }),
      ]);
      return NextResponse.json({ success: true, message: 'Request accepted' });
    } else {
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ success: true, message: 'Request rejected' });
    }
  } catch (error: any) {
    console.error('Accept friend request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
