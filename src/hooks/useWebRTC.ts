'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { getPusherInstance } from './useSocket';

export function useWebRTC() {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const { user } = useAuthStore();
  const {
    setLocalStream,
    setRemoteStream,
    partner,
    isInitiator,
    isScreenSharing,
    setScreenSharing,
  } = useChatStore();

  const initializeMedia = useCallback(async () => {
    const currentStream = useChatStore.getState().localStream;
    if (currentStream) return currentStream;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Failed to get media:', error);
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setLocalStream(audioOnly);
        return audioOnly;
      } catch {
        console.error('No media devices available');
        return null;
      }
    }
  }, [setLocalStream]);

  const sendSignal = async (type: string, signal: any) => {
    if (!partner) return;
    try {
      await fetch('/api/match/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: partner.id,
          type,
          signal,
        }),
      });
    } catch (err) {
      console.error('Signal dispatch failed', err);
    }
  };

  const createPeerConnection = useCallback(
    async (localStream: MediaStream) => {
      const iceServers: RTCIceServer[] = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ];

      const pc = new RTCPeerConnection({ iceServers });

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          setRemoteStream(remoteStream);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal('ice-candidate', event.candidate.toJSON());
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'failed') {
          pc.restartIce();
        }
      };

      peerConnectionRef.current = pc;

      // Subscribe to user private channel signals via active Pusher instance
      const pusher = getPusherInstance();
      if (pusher && user?.id) {
        const userChannel = pusher.subscribe(`private-user-${user.id}`);

        userChannel.bind('signal:offer', async (data: { from: string; signal: any }) => {
          if (pc.signalingState !== 'stable') return;
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal('answer', answer);
        });

        userChannel.bind('signal:answer', async (data: { from: string; signal: any }) => {
          if (pc.signalingState === 'stable') return;
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
        });

        userChannel.bind('signal:ice-candidate', async (data: { from: string; signal: any }) => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.signal));
          } catch (err) {
            console.error('Failed to add candidate:', err);
          }
        });
      }

      return pc;
    },
    [user, partner, setRemoteStream]
  );

  const startCall = useCallback(async () => {
    let stream = useChatStore.getState().localStream;
    if (!stream) {
      stream = await initializeMedia();
    }
    if (!stream) return;

    const pc = await createPeerConnection(stream);

    if (isInitiator) {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      await sendSignal('offer', offer);
    }
  }, [initializeMedia, createPeerConnection, isInitiator]);

  const endCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    const localStreamObj = useChatStore.getState().localStream;
    if (localStreamObj) {
      localStreamObj.getTracks().forEach((t) => t.stop());
    }

    setLocalStream(null);
    setRemoteStream(null);
  }, [setLocalStream, setRemoteStream]);

  const toggleScreenShare = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    if (isScreenSharing) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
      setScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
        }
        screenTrack.onended = () => {
          setScreenSharing(false);
          toggleScreenShare();
        };
        setScreenSharing(true);
      } catch {
        console.error('Screen sharing failed');
      }
    }
  }, [isScreenSharing, setScreenSharing]);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    startCall,
    endCall,
    toggleScreenShare,
    initializeMedia,
    peerConnection: peerConnectionRef.current,
  };
}
