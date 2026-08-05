import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import DirectChatClient from './DirectChatClient';

export default async function DirectMessagePage(props: { params: Promise<{ friendId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/login');
  
  const userId = (session.user as any).id;
  // Await the params before using its properties (Next.js 15 requirement)
  const resolvedParams = await props.params;
  const friendId = resolvedParams.friendId;

  // Verify friendship
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: userId, userBId: friendId },
        { userAId: friendId, userBId: userId },
      ],
    },
  });

  if (!friendship) redirect('/friends');

  // Fetch friend details
  const friend = await prisma.user.findUnique({
    where: { id: friendId },
    select: { id: true, username: true, displayName: true, avatar: true, isOnline: true, lastSeen: true },
  });

  if (!friend) redirect('/friends');

  return <DirectChatClient currentUser={session.user as any} friend={friend} />;
}
