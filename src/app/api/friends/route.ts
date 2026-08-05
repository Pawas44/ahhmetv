import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        userB: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    });

    const friends = friendships.map((f) => {
      const isUserA = f.userAId === userId;
      const friendData = isUserA ? f.userB : f.userA;
      return {
        ...friendData,
        friendshipId: f.id,
      };
    });

    return NextResponse.json({ friends });
  } catch (error: any) {
    console.error('List friends error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const friendshipId = searchParams.get('id');

    if (!friendshipId) {
      return NextResponse.json({ error: 'Friendship ID required' }, { status: 400 });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || (friendship.userAId !== userId && friendship.userBId !== userId)) {
      return NextResponse.json({ error: 'Friendship not found or unauthorized' }, { status: 404 });
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return NextResponse.json({ success: true, message: 'Friend removed' });
  } catch (error: any) {
    console.error('Remove friend error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
