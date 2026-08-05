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

    const reporterId = (session.user as any).id;
    const body = await req.json();
    const { reportedId, reason, description, block } = body;

    if (!reportedId || !reason) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedId,
        reason,
        description,
        status: 'PENDING',
      },
    });

    if (block) {
      await prisma.block.upsert({
        where: {
          blockerId_blockedId: {
            blockerId: reporterId,
            blockedId: reportedId,
          },
        },
        create: {
          blockerId: reporterId,
          blockedId: reportedId,
        },
        update: {},
      });
    }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Submit report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
