import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ChatState = {
  unreadByRoomId: Record<string, number>;
  unreadByPeerId: Record<string, number>;
  privatePeers: string[];
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  ensurePrivatePeer: (peerId: string) => void;
  removePrivatePeer: (peerId: string) => void;
  incrementRoomUnread: (roomId: string, delta?: number) => void;
  clearRoomUnread: (roomId: string) => void;
  incrementPeerUnread: (peerId: string, delta?: number) => void;
  clearPeerUnread: (peerId: string) => void;
  getUnreadTotal: () => number;
};

const STORAGE_KEY = "mall_chat_state_v1";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      unreadByRoomId: {},
      unreadByPeerId: {},
      privatePeers: [],
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      ensurePrivatePeer: (peerId) => {
        if (!peerId) return;
        set((state) => {
          if (state.privatePeers.includes(peerId)) {
            return state;
          }
          return { ...state, privatePeers: [peerId, ...state.privatePeers].slice(0, 30) };
        });
      },
      removePrivatePeer: (peerId) => {
        if (!peerId) return;
        set((state) => {
          const nextPeers = state.privatePeers.filter((id) => id !== peerId);
          const restUnread = { ...state.unreadByPeerId };
          delete restUnread[peerId];
          return {
            ...state,
            privatePeers: nextPeers,
            unreadByPeerId: restUnread,
          };
        });
      },
      incrementRoomUnread: (roomId, delta = 1) => {
        if (!roomId) return;
        set((state) => ({
          ...state,
          unreadByRoomId: {
            ...state.unreadByRoomId,
            [roomId]: Math.max(0, (state.unreadByRoomId[roomId] ?? 0) + delta),
          },
        }));
      },
      clearRoomUnread: (roomId) => {
        if (!roomId) return;
        set((state) => ({
          ...state,
          unreadByRoomId: { ...state.unreadByRoomId, [roomId]: 0 },
        }));
      },
      incrementPeerUnread: (peerId, delta = 1) => {
        if (!peerId) return;
        set((state) => ({
          ...state,
          unreadByPeerId: {
            ...state.unreadByPeerId,
            [peerId]: Math.max(0, (state.unreadByPeerId[peerId] ?? 0) + delta),
          },
        }));
      },
      clearPeerUnread: (peerId) => {
        if (!peerId) return;
        set((state) => ({
          ...state,
          unreadByPeerId: { ...state.unreadByPeerId, [peerId]: 0 },
        }));
      },
      getUnreadTotal: () => {
        const { unreadByRoomId, unreadByPeerId } = get();
        return (
          Object.values(unreadByRoomId).reduce((sum, value) => sum + (value ?? 0), 0) +
          Object.values(unreadByPeerId).reduce((sum, value) => sum + (value ?? 0), 0)
        );
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        unreadByRoomId: state.unreadByRoomId,
        unreadByPeerId: state.unreadByPeerId,
        privatePeers: state.privatePeers,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);
