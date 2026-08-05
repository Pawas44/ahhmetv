import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const runtime = 'nodejs'; // Edge Runtime doesn't support some adapters, Node.js is safe
