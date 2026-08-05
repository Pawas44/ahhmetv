export interface User {
  id: string;
  email: string | null;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  age: number | null;
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
  country: string | null;
  languages: string[];
  interests: string[];
  socialLinks: Record<string, string> | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isVerified: boolean;
  isEmailVerified: boolean;
  isPremium: boolean;
  isOnline: boolean;
  isGuest: boolean;
  lastSeen: string;
  createdAt: string;
}

export interface PartnerInfo {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  country: string | null;
  gender?: string | null;
  isPremium: boolean;
  isVerified: boolean;
}

export interface MatchFilters {
  interests?: string[];
  country?: string | null;
  gender?: string | null;
  language?: string | null;
  ageMin?: number | null;
  ageMax?: number | null;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'emoji' | 'gif' | 'image' | 'file';
  timestamp: number;
  isRead?: boolean;
}

export interface FriendRequest {
  id: string;
  sender: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
    isOnline: boolean;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string;
  friendshipId: string;
}

export interface Report {
  id: string;
  reporter: { id: string; username: string; displayName: string | null; avatar: string | null };
  reported: { id: string; username: string; displayName: string | null; avatar: string | null; isBanned: boolean };
  reason: string;
  description: string | null;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  reviewedBy: string | null;
  reviewNotes: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  plan: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'PENDING';
  description: string | null;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'update' | 'maintenance';
  isActive: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  onlineUsers: number;
  totalReports: number;
  pendingReports: number;
  totalCalls: number;
  premiumUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
}
