'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, UserMinus, Check, X, Clock, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Friend, FriendRequest } from '@/types';

export default function FriendsPage() {
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFriends = async () => {
    try {
      const friendsRes = await fetch('/api/friends');
      const friendsData = await friendsRes.json();

      const requestsRes = await fetch('/api/friends/request');
      const requestsData = await requestsRes.json();

      setFriends(friendsData.friends || []);
      setRequests(requestsData.requests || []);
    } catch (error) {
      console.error('Failed to load friends list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'ACCEPTED' }),
      });
      if (res.ok) {
        toast.success('Friend request accepted!');
        loadFriends();
      }
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'REJECTED' }),
      });
      if (res.ok) {
        toast.success('Friend request rejected');
        loadFriends();
      }
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends?id=${friendshipId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Friend removed');
        setFriends(friends.filter(f => f.friendshipId !== friendshipId));
      }
    } catch {
      toast.error('Failed to remove friend');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Friends</h1>
        <p className="text-muted mb-8">Manage your friends and requests</p>

        {/* Tab Controls */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('friends')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'friends' ? 'bg-primary/20 text-primary-light border border-primary/30' : 'glass-hover text-muted'
            }`}
          >
            <Users className="w-4 h-4" /> Friends ({friends.length})
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'requests' ? 'bg-primary/20 text-primary-light border border-primary/30' : 'glass-hover text-muted'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Requests
            {requests.length > 0 && (
              <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {/* Listing Area */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : tab === 'friends' ? (
          <div className="space-y-3">
            {friends.length === 0 ? (
              <div className="glass-card text-center py-12">
                <Users className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Friends Yet</h3>
                <p className="text-sm text-muted">Start chatting and add friends you connect with!</p>
              </div>
            ) : (
              friends.map((friend) => (
                <motion.div key={friend.friendshipId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card flex items-center gap-4 !py-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center font-bold overflow-hidden">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt="" className="w-12 h-12 object-cover" />
                      ) : (
                        friend.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${friend.isOnline ? 'bg-success' : 'bg-muted-darker'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{friend.displayName || friend.username}</p>
                    <p className="text-xs text-muted">
                      {friend.isOnline ? 'Online now' : `Last seen ${new Date(friend.lastSeen).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/messages/${friend.id}`} 
                      className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                      title="Send Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleRemoveFriend(friend.friendshipId)} className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors">
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="glass-card text-center py-12">
                <UserPlus className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                <p className="text-sm text-muted">You&apos;re all caught up!</p>
              </div>
            ) : (
              requests.map((request) => (
                <motion.div key={request.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card flex items-center gap-4 !py-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center font-bold overflow-hidden">
                    {request.sender.avatar ? (
                      <img src={request.sender.avatar} alt="" className="w-12 h-12 object-cover" />
                    ) : (
                      request.sender.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{request.sender.displayName || request.sender.username}</p>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAccept(request.id)} className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleReject(request.id)} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
export const runtime = 'nodejs';
