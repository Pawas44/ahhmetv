import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/db';
import { sendPasswordResetEmail } from '@/services/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // To prevent email enum, always return success even if user doesn't exist
    if (user) {
      const resetToken = uuidv4();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.verificationToken.upsert({
        where: { token: resetToken },
        create: {
          identifier: email,
          token: resetToken,
          expires: expiry,
        },
        update: {
          expires: expiry,
        },
      });

      try {
        await sendPasswordResetEmail(email, resetToken);
      } catch (err) {
        console.error('Password reset email error:', err);
      }
    }

    return NextResponse.json({ message: 'If this email is registered, a password reset link has been sent.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const runtime = 'nodejs';
