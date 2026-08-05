import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const userId = (session.user as any).id;
    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    // Find the token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or incorrect OTP' }, { status: 400 });
    }

    if (new Date() > tokenRecord.expires) {
      // Delete expired token
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // OTP is valid. Delete the user
    // Since we use foreign keys with Cascade in Prisma schema, deleting the user will delete their messages, friends, calls, etc.
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clean up the token
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json({ success: true, message: 'Account permanently deleted' });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
