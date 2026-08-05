import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Server side instance
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
  useTLS: true,
});

// Client side generator helper
export const getPusherClient = (token: string) => {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
