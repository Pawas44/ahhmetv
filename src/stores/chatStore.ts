import { create } from 'zustand';
import type { ChatMessage, PartnerInfo, MatchFilters } from '@/types';

type ChatStatus = 'idle' | 'searching' | 'connected' | 'disconnected';

interface ChatState {
  status: ChatStatus;
  partner: PartnerInfo | null;
  callId: string | null;
  roomId: string | null;
  isInitiator: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  partnerTyping: boolean;
  filters: MatchFilters;
  callDuration: number;
  onlineCount: number;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  isFullscreen: boolean;

  setStatus: (status: ChatStatus) => void;
  setPartner: (partner: PartnerInfo | null) => void;
  setCallInfo: (callId: string, roomId: string, isInitiator: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setIsTyping: (isTyping: boolean) => void;
  setPartnerTyping: (partnerTyping: boolean) => void;
  setFilters: (filters: MatchFilters) => void;
  setCallDuration: (duration: number) => void;
  setOnlineCount: (count: number) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  setScreenSharing: (isScreenSharing: boolean) => void;
  setFullscreen: (isFullscreen: boolean) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as ChatStatus,
  partner: null,
  callId: null,
  roomId: null,
  isInitiator: false,
  messages: [],
  isTyping: false,
  partnerTyping: false,
  filters: {},
  callDuration: 0,
  onlineCount: 0,
  localStream: null,
  remoteStream: null,
  isCameraOn: true,
  isMicOn: true,
  isScreenSharing: false,
  isFullscreen: false,
};

export const useChatStore = create<ChatState>()((set, get) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setPartner: (partner) => set({ partner }),
  setCallInfo: (callId, roomId, isInitiator) => set({ callId, roomId, isInitiator }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setPartnerTyping: (partnerTyping) => set({ partnerTyping }),
  setFilters: (filters) => set({ filters }),
  setCallDuration: (callDuration) => set({ callDuration }),
  setOnlineCount: (onlineCount) => set({ onlineCount }),
  setLocalStream: (localStream) => set({ localStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  toggleCamera: () => {
    const stream = get().localStream;
    const isCameraOn = !get().isCameraOn;
    if (stream) {
      stream.getVideoTracks().forEach((t) => (t.enabled = isCameraOn));
    }
    set({ isCameraOn });
  },
  toggleMic: () => {
    const stream = get().localStream;
    const isMicOn = !get().isMicOn;
    if (stream) {
      stream.getAudioTracks().forEach((t) => (t.enabled = isMicOn));
    }
    set({ isMicOn });
  },
  setScreenSharing: (isScreenSharing) => set({ isScreenSharing }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  reset: () => {
    const stream = get().localStream;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    set(initialState);
  },
}));
export default useChatStore;
