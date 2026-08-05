'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, MoreVertical, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getPusherClient } from '@/lib/pusher';
import { useAuthStore } from '@/stores/authStore';
import type { ChatMessage, User } from '@/types';

interface DirectChatClientProps {
  currentUser: User;
  friend: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: Date;
  };
}

export default function DirectChatClient({ currentUser, friend }: DirectChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${friend.id}`);
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        toast.error('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [friend.id]);

  // Pusher real-time updates
  useEffect(() => {
    if (!accessToken) return;
    const pusherClient = getPusherClient(accessToken);
    const channelName = `private-user-${currentUser.id}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind('chat:message', (newMessage: ChatMessage) => {
      // Only append if the message is from this specific friend
      if (newMessage.senderId === friend.id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      channel.unbind('chat:message');
      pusherClient.unsubscribe(channelName);
    };
  }, [currentUser.id, friend.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const content = input.trim();
    setInput('');

    // Optimistic UI update
    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.displayName || currentUser.username,
      content,
      type: 'text',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type: 'text',
          receiverId: friend.id,
          callId: null, // This implies it's a direct message, not in a call
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send');
      }
    } catch (error) {
      toast.error('Failed to send message');
      // Rollback optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-background-secondary sm:border-x border-white/5">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-background">
        <Link href="/friends" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted hover:text-white" />
        </Link>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center font-bold overflow-hidden shadow-glow-sm">
            {friend.avatar ? (
              <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(friend.displayName || friend.username)
            )}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${friend.isOnline ? 'bg-success' : 'bg-muted-darker'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{friend.displayName || friend.username}</h2>
          <p className="text-xs text-muted">
            {friend.isOnline ? 'Online now' : `Last seen ${new Date(friend.lastSeen).toLocaleDateString()}`}
          </p>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/5 text-muted transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {/* Trust & Safety Warning */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20 max-w-md mx-auto mb-6">
          <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-xs text-warning/90">
            Never share passwords or personal information. AHHHMETV staff will never ask for your password.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs mt-1">Say hi to {friend.displayName || friend.username}!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-white/10 text-white rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-muted mt-1 px-1">
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-white/5">
        <form onSubmit={handleSend} className="flex items-center gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-[#0a0a1a] border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted"
            autoComplete="off"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-primary/20 disabled:hover:text-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
