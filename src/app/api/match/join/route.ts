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
    const { interests, country, gender, language } = body;

    // Update current user heartbeat
    const currentUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        lastSeen: new Date(),
      },
    });

    // Check if another user has recently created a call with us
    const incomingCall = await prisma.call.findFirst({
      where: {
        calleeId: userId,
        status: 'ACTIVE',
        startedAt: {
          gte: new Date(Date.now() - 10000), // Within last 10s
        },
      },
      include: {
        caller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
            country: true,
            isPremium: true,
            isVerified: true,
          },
        },
      },
    });

    if (incomingCall) {
      return NextResponse.json({
        matched: true,
        callId: incomingCall.id,
        roomId: incomingCall.id,
        partner: {
          id: incomingCall.caller.id,
          username: incomingCall.caller.username,
          displayName: incomingCall.caller.displayName,
          avatar: incomingCall.caller.image,
          country: incomingCall.caller.country,
          isPremium: incomingCall.caller.isPremium,
          isVerified: incomingCall.caller.isVerified,
        },
        isInitiator: false,
      });
    }

    // Attempt to find a match (online in last 5 seconds, not in an active call, not ourselves)
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    // Apply optional filters
    const filterQuery: any = {};
    if (country) filterQuery.country = country;
    if (gender && gender !== 'Any') filterQuery.gender = gender;

    const potentialMatch = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        isOnline: true,
        lastSeen: { gte: fiveSecondsAgo },
        isBanned: false,
        ...filterQuery,
        // Ensure they aren't already in an active call
        NOT: {
          OR: [
            {
              callsAsCaller: {
                some: { status: 'ACTIVE' },
              },
            },
            {
              callsAsCallee: {
                some: { status: 'ACTIVE' },
              },
            },
          ],
        },
      },
    });

    if (potentialMatch) {
      // Create new call record
      const call = await prisma.call.create({
        data: {
          callerId: userId,
          calleeId: potentialMatch.id,
          status: 'ACTIVE',
        },
      });

      const matchPayload = {
        matched: true,
        callId: call.id,
        roomId: call.id,
        partner: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName || currentUser.name,
          avatar: currentUser.image,
          country: currentUser.country,
          gender: (currentUser as any).gender,
          isPremium: currentUser.isPremium,
          isVerified: currentUser.isVerified,
        },
        isInitiator: false,
      };

      // Notify the potential match via Pusher
      await pusherServer.trigger(`private-user-${potentialMatch.id}`, 'match:found', matchPayload);

      return NextResponse.json({
        matched: true,
        callId: call.id,
        roomId: call.id,
        partner: {
          id: potentialMatch.id,
          username: potentialMatch.username,
          displayName: potentialMatch.displayName || potentialMatch.name,
          avatar: potentialMatch.image,
          country: potentialMatch.country,
          gender: (potentialMatch as any).gender,
          isPremium: potentialMatch.isPremium,
          isVerified: potentialMatch.isVerified,
        },
        isInitiator: true,
      });
    }

    return NextResponse.json({ matched: false });
  } catch (error: any) {
    console.error('Match join API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
