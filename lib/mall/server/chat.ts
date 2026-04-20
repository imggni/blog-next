import { apiRequest } from "@/lib/mall/server/request";
import type {
  ChatMessage,
  ChatMessagePrivateSendRequest,
  ChatMessageRoomSendRequest,
  ChatPresenceMap,
  ChatRoom,
  ChatRoomCreateRequest,
  ChatRoomMemberItem,
} from "@/types/api";

export type ChatHistoryParams = {
  roomId?: string;
  senderId?: string;
  receiverId?: string;
  take?: number;
};

function buildSearchParams(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    search.set(key, String(value));
  });
  return search.toString();
}

export const chatApi = {
  getRooms: () => apiRequest<ChatRoom[]>("/chat/rooms"),
  createRoom: (payload: ChatRoomCreateRequest) =>
    apiRequest<ChatRoom>("/chat/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  joinRoom: (roomId: string) => apiRequest<void>(`/chat/rooms/${roomId}/join`, { method: "POST" }),
  leaveRoom: (roomId: string) => apiRequest<void>(`/chat/rooms/${roomId}/leave`, { method: "POST" }),
  getRoomMembers: (roomId: string) => apiRequest<ChatRoomMemberItem[]>(`/chat/rooms/${roomId}/members`),
  sendPrivateMessage: (payload: ChatMessagePrivateSendRequest) =>
    apiRequest<ChatMessage>("/chat/messages/private", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  sendRoomMessage: (payload: ChatMessageRoomSendRequest) =>
    apiRequest<ChatMessage>("/chat/messages/room", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getHistory: (params: ChatHistoryParams) => {
    const search = buildSearchParams({
      roomId: params.roomId,
      senderId: params.senderId,
      receiverId: params.receiverId,
      take: params.take,
    });
    const suffix = search ? `?${search}` : "";
    return apiRequest<ChatMessage[]>(`/chat/messages/history${suffix}`);
  },
  markMessageRead: (messageId: string) => apiRequest<void>(`/chat/messages/${messageId}/read`, { method: "PUT" }),
  getPresence: (userIds: string[]) => {
    const search = buildSearchParams({
      userIds: userIds.join(","),
    });
    const suffix = search ? `?${search}` : "";
    return apiRequest<ChatPresenceMap>(`/chat/presence${suffix}`);
  },
};
