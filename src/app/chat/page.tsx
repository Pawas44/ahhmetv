'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, SkipForward, Monitor, Send,
  Shield, UserPlus, Flag, Clock, Wifi, WifiOff, MessageCircle, Filter, X
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useChatStore } from '@/stores/chatStore';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import type { MatchFilters } from '@/types';

export default function ChatPage() {
  const [messageInput, setMessageInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MatchFilters>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    status, partner, messages, partnerTyping, onlineCount,
    localStream, remoteStream, isCameraOn, isMicOn,
    callDuration, setCallDuration, toggleCamera, toggleMic,
  } = useChatStore();

  const { data: session } = useSession();
  const { joinMatchQueue, leaveMatchQueue, skipMatch, sendMessage, sendTyping } = useSocket();
  const { startCall, endCall, toggleScreenShare } = useWebRTC();

  // Attach local streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote streams
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle call setup on match
  useEffect(() => {
    if (status === 'connected' && partner) {
      startCall();
    }
  }, [status, partner, startCall]);

  // Handle duration counter
  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(useChatStore.getState().callDuration + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, setCallDuration]);

  // Scroll to new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartChat = () => {
    joinMatchQueue(filters);
  };

  const handleSkip = () => {
    endCall();
    skipMatch();
    setCallDuration(0);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleAddFriend = async () => {
    if (!partner) return;
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: partner.id }),
      });
      if (res.ok) {
        toast.success('Friend request sent!');
      } else {
        const d = await res.json();
        toast.error(d.error || 'Could not send request');
      }
    } catch {
      toast.error('Failed to send request');
    }
  };

  const handleReport = async () => {
    if (!partner) return;
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedId: partner.id, reason: 'HARASSMENT', block: true }),
      });
      if (res.ok) {
        toast.success('User reported and blocked');
        handleSkip();
      }
    } catch {
      toast.error('Could not report user');
    }
  };

  const userId = (session?.user as any)?.id;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-background">
      {/* Video Stream Area */}
      <div className="flex-1 relative flex items-center justify-center bg-background-secondary">
        {status === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-4 max-w-lg">
            <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow-purple">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Ready to Chat?</h2>
            <p className="text-muted mb-8">Spontaneous, secure video chat. Tap start to meet new friends around the world.</p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-success">{onlineCount.toLocaleString()} people online</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={handleStartChat} className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                <Video className="w-5 h-5" /> Start Chat
              </button>
              <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 glass rounded-2xl p-6 text-left"
                >
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Match Filters
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted mb-1 block">Country</label>
                      <input
                        type="text"
                        value={filters.country || ''}
                        onChange={(e) => setFilters({ ...filters, country: e.target.value || null })}
                        placeholder="Any country"
                        className="glass-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">Language</label>
                      <input
                        type="text"
                        value={filters.language || ''}
                        onChange={(e) => setFilters({ ...filters, language: e.target.value || null })}
                        placeholder="Any language"
                        className="glass-input w-full text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {status === 'searching' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="w-8 h-8 text-primary-light" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Finding a match...</h2>
            <p className="text-muted mb-6">{onlineCount} people online</p>
            <button onClick={() => leaveMatchQueue()} className="btn-secondary">
              Cancel
            </button>
          </motion.div>
        )}

        {(status === 'connected' || status === 'disconnected') && (
          <>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

            <div className="absolute bottom-24 right-4 w-40 h-28 sm:w-52 sm:h-36 rounded-2xl overflow-hidden glass border-2 border-white/10 shadow-xl">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              {!isCameraOn && (
                <div className="absolute inset-0 bg-background-secondary flex items-center justify-center">
                  <VideoOff className="w-6 h-6 text-muted" />
                </div>
              )}
            </div>

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {partner && (
                  <div className="glass rounded-xl px-4 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                      {partner.displayName?.charAt(0) || partner.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{partner.displayName || partner.username}</p>
                      {partner.country && <p className="text-xs text-muted">{partner.country}</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted" />
                  <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
                </div>
                <div className="glass rounded-lg px-3 py-1.5">
                  <Wifi className="w-3.5 h-3.5 text-success" />
                </div>
              </div>
            </div>

            {status === 'disconnected' && (
              <div className="absolute inset-0 bg-background/85 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <WifiOff className="w-12 h-12 text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Partner Disconnected</h3>
                  <div className="flex gap-3 justify-center mt-4">
                    <button onClick={handleStartChat} className="btn-primary">Find New Match</button>
                    <button onClick={handleSkip} className="btn-secondary">Leave</button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Action Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCameraOn ? 'glass hover:bg-white/10' : 'bg-danger/80 hover:bg-danger'}`}>
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'glass hover:bg-white/10' : 'bg-danger/80 hover:bg-danger'}`}>
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button onClick={toggleScreenShare} className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </button>
              <button onClick={handleSkip} className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center text-accent">
                <SkipForward className="w-5 h-5" />
              </button>
              <button onClick={handleSkip} className="w-14 h-12 rounded-full bg-danger hover:bg-danger/80 flex items-center justify-center">
                <PhoneOff className="w-5 h-5" />
              </button>
              <button onClick={handleAddFriend} className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center text-success">
                <UserPlus className="w-5 h-5" />
              </button>
              <button onClick={handleReport} className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center text-warning">
                <Flag className="w-5 h-5" />
              </button>
              <button onClick={() => setShowChat(!showChat)} className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center lg:hidden">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Messaging Chat Sidebar */}
      <AnimatePresence>
        {showChat && (status === 'connected' || status === 'disconnected') && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-l border-white/5 flex flex-col bg-background overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="font-semibold">Text Chat</span>
              <button onClick={() => setShowChat(false)} className="lg:hidden p-1 hover:bg-white/5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.senderId === userId ? 'bg-gradient-primary text-white' : 'glass'}`}>
                    <p className="text-xs opacity-50 mb-1">{msg.senderName}</p>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              {partnerTyping && <div className="text-xs text-muted animate-pulse">Partner is typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  sendTyping(e.target.value.length > 0);
                }}
                placeholder="Send message..."
                className="glass-input flex-1"
              />
              <button type="submit" className="btn-primary !px-4"><Send className="w-4 h-4" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export const runtime = 'nodejs';
