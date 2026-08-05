'use client';

import { useEffect, useRef, useCallback } from 'react';
import Pusher from 'pusher-js';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import type { MatchFilters } from '@/types';

let pusherInstance: Pusher | null = null;

export function useSocket() {
  const pusherRef = useRef<Pusher | null>(null);
  const userChannelRef = useRef<any>(null);
  const callChannelRef = useRef<any>(null);

  const { user, accessToken, isAuthenticated } = useAuthStore();
  const {
    setStatus,
    setPartner,
    setCallInfo,
    addMessage,
    setPartnerTyping,
    setOnlineCount,
    clearMessages,
    roomId,
    callId,
  } = useChatStore();

  const connect = useCallback(() => {
    if (pusherRef.current) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '';

    if (!pusherKey) {
      console.warn('Pusher key is not configured');
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          // Send request token or standard session check
        },
      },
    });

    pusherRef.current = pusher;
    pusherInstance = pusher;

    // Track online user count in standard matchmaking presence channel
    const presenceChannel = pusher.subscribe('presence-matchmaking');

    presenceChannel.bind('pusher:subscription_succeeded', (members: any) => {
      setOnlineCount(members.count);
    });

    presenceChannel.bind('pusher:member_added', () => {
      setOnlineCount((presenceChannel as any).members?.count || 0);
    });

    presenceChannel.bind('pusher:member_removed', () => {
      setOnlineCount((presenceChannel as any).members?.count || 0);
    });

    // Subscribe to private user channel for matchmaking alerts
    if (user?.id) {
      const userChannel = pusher.subscribe(`private-user-${user.id}`);
      userChannelRef.current = userChannel;

      userChannel.bind('match:found', (data: any) => {
        setStatus('connected');
        setPartner(data.partner);
        setCallInfo(data.callId, data.roomId, data.isInitiator);
        clearMessages();

        // Subscribe to private call chat room
        subscribeToCall(data.roomId);
      });

      userChannel.bind('match:skipped', () => {
        setStatus('idle');
        setPartner(null);
        clearMessages();
        unsubscribeFromCall();
      });
    }
  }, [user, setStatus, setPartner, setCallInfo, addMessage, setPartnerTyping, setOnlineCount, clearMessages]);

  const disconnect = useCallback(() => {
    if (pusherRef.current) {
      pusherRef.current.disconnect();
      pusherRef.current = null;
      pusherInstance = null;
    }
  }, []);

  const subscribeToCall = useCallback(
    (activeRoomId: string) => {
      if (!pusherRef.current) return;
      unsubscribeFromCall();

      const channel = pusherRef.current.subscribe(`private-call-${activeRoomId}`);
      callChannelRef.current = channel;

      channel.bind('chat:message', (data: any) => {
        // Only add if it's not from us (prevent duplicate from optimistic update)
        if (data.senderId !== useAuthStore.getState().user?.id) {
          addMessage(data);
        }
      });

      channel.bind('chat:typing', (data: { isTyping: boolean; userId: string }) => {
        if (data.userId !== user?.id) {
          setPartnerTyping(data.isTyping);
        }
      });
    },
    [user, addMessage, setPartnerTyping]
  );

  const unsubscribeFromCall = useCallback(() => {
    if (pusherRef.current && roomId) {
      pusherRef.current.unsubscribe(`private-call-${roomId}`);
      callChannelRef.current = null;
    }
  }, [roomId]);

  const joinMatchQueue = useCallback(
    async (filters: MatchFilters = {}) => {
      setStatus('searching');
      try {
        const res = await fetch('/api/match/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters),
        });
        const data = await res.json();

        if (data.matched) {
          setStatus('connected');
          setPartner(data.partner);
          setCallInfo(data.callId, data.roomId, data.isInitiator);
          clearMessages();
          subscribeToCall(data.roomId);
        } else {
          // Recheck/poll helper in case matchmaking is pending
          const interval = setInterval(async () => {
            if (useChatStore.getState().status !== 'searching') {
              clearInterval(interval);
              return;
            }
            const pollRes = await fetch('/api/match/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(filters),
            });
            const pollData = await pollRes.json();
            if (pollData.matched) {
              clearInterval(interval);
              setStatus('connected');
              setPartner(pollData.partner);
              setCallInfo(pollData.callId, pollData.roomId, pollData.isInitiator);
              clearMessages();
              subscribeToCall(pollData.roomId);
            }
          }, 4000);
        }
      } catch (err) {
        console.error('Match join error', err);
        setStatus('idle');
      }
    },
    [setStatus, setPartner, setCallInfo, clearMessages, subscribeToCall]
  );

  const leaveMatchQueue = useCallback(() => {
    setStatus('idle');
  }, [setStatus]);

  const skipMatch = useCallback(async () => {
    const activeCallId = useChatStore.getState().callId;
    if (activeCallId) {
      await fetch('/api/match/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: activeCallId }),
      });
    }
    setStatus('idle');
    setPartner(null);
    clearMessages();
    unsubscribeFromCall();
  }, [setStatus, setPartner, clearMessages, unsubscribeFromCall]);

  const sendMessage = useCallback(
    async (content: string, type: string = 'text') => {
      const activePartner = useChatStore.getState().partner;
      const activeCallId = useChatStore.getState().callId;
      const { user } = useAuthStore.getState();
      const addMessage = useChatStore.getState().addMessage;
      
      if (!activePartner) return;

      // Optimistic update
      const tempId = Date.now().toString();
      addMessage({
        id: tempId,
        senderId: user?.id || '',
        senderName: user?.displayName || user?.username || 'You',
        content,
        type: type as any,
        timestamp: Date.now(),
      });

      try {
        await fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            type,
            receiverId: activePartner.id,
            callId: activeCallId,
          }),
        });
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    },
    []
  );

  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      // Direct client trigger could be used or a simple skip
    },
    []
  );

  const reconnectPrevious = useCallback(() => {
    // Matches default behavior
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return {
    joinMatchQueue,
    leaveMatchQueue,
    skipMatch,
    sendMessage,
    sendTyping,
    reconnectPrevious,
  };
}

export function getPusherInstance() {
  return pusherInstance;
}
