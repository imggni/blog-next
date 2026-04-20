"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { ChatComposer } from "@/components/mall/chat/chat-composer"
import { ChatMessageBubble } from "@/components/mall/chat/chat-message-bubble"
import { ChatRoomList } from "@/components/mall/chat/chat-room-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MoreVertical, Trash2 } from "lucide-react"
import { useAuthStore } from "@/hooks/use-auth-store"
import { useChatStore } from "@/hooks/use-chat-store"
import { chatApi, ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { ChatMessage, ChatRoom, ChatUserSummary } from "@/types/api"

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>
  }
  return {}
}

function getString(record: Record<string, unknown>, key: string, fallback = "") {
  const value = record[key]
  return typeof value === "string" ? value : value != null ? String(value) : fallback
}

function getNullableString(record: Record<string, unknown>, key: string) {
  const value = record[key]
  if (value == null || value === "") {
    return null
  }
  return typeof value === "string" ? value : String(value)
}

function truncateId(value: string) {
  if (!value) return ""
  return value.length > 10 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

type Thread =
  | { kind: "room"; roomId: string }
  | { kind: "private"; peerId: string }

type UiMessage = {
  id: string
  senderId: string
  receiverId: string | null
  roomId: string | null
  content: string
  isRead: boolean | null
  sendTime: string
  sender?: ChatUserSummary | null
  receiver?: ChatUserSummary | null
}

function fromApiMessage(message: ChatMessage): UiMessage {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId ?? null,
    roomId: message.roomId ?? null,
    content: message.content,
    isRead: message.isRead,
    sendTime: message.sendTime,
    sender: message.sender ?? null,
    receiver: message.receiver ?? null,
  }
}

function fromDatabaseRecord(raw: Record<string, unknown>): UiMessage {
  return {
    id: getString(raw, "id"),
    senderId: getString(raw, "sender_id"),
    receiverId: getNullableString(raw, "receiver_id"),
    roomId: getNullableString(raw, "room_id"),
    content: getString(raw, "content"),
    isRead: typeof raw.is_read === "boolean" ? raw.is_read : null,
    sendTime: getString(raw, "send_time", new Date().toISOString()),
  }
}

function toUserSummary(value: unknown): ChatUserSummary | null {
  const record = asRecord(value)
  const id = getString(record, "id")
  if (!id) {
    return null
  }

  return {
    id,
    username: getString(record, "username", id.slice(0, 6)),
    avatar: getNullableString(record, "avatar"),
  }
}

function toUiMessage(value: unknown): UiMessage | null {
  const record = asRecord(value)
  if (record.senderId != null) {
    return {
      id: getString(record, "id"),
      senderId: getString(record, "senderId"),
      receiverId: getNullableString(record, "receiverId"),
      roomId: getNullableString(record, "roomId"),
      content: getString(record, "content"),
      isRead: typeof record.isRead === "boolean" ? record.isRead : null,
      sendTime: getString(record, "sendTime", new Date().toISOString()),
      sender: toUserSummary(record.sender),
      receiver: toUserSummary(record.receiver),
    }
  }

  if (record.sender_id != null || record.room_id != null || record.receiver_id != null) {
    return fromDatabaseRecord(record)
  }

  return null
}

function getPeerId(currentUserId: string, message: UiMessage) {
  if (message.roomId) return null
  if (message.senderId && message.senderId !== currentUserId) return message.senderId
  if (message.receiverId && message.receiverId !== currentUserId) return message.receiverId
  return null
}

type SseEvent = {
  event: string
  data: string
}

async function* sseIterator(stream: ReadableStream<Uint8Array>, signal: AbortSignal) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      if (signal.aborted) {
        return
      }

      const { value, done } = await reader.read()
      if (done) {
        return
      }

      buffer += decoder.decode(value, { stream: true })

      while (true) {
        const index = buffer.indexOf("\n\n")
        if (index < 0) {
          break
        }

        const raw = buffer.slice(0, index)
        buffer = buffer.slice(index + 2)

        const lines = raw.split(/\r?\n/)
        let eventName = ""
        const dataLines: string[] = []

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim()
            continue
          }

          if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trimStart())
          }
        }

        const data = dataLines.join("\n")
        if (!data) {
          continue
        }

        yield { event: eventName || "message", data } satisfies SseEvent
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export default function MallChatPage() {
  return (
    <Suspense
      fallback={
        <Card className="rounded-[2rem] border-border/70">
          <CardHeader>
            <CardTitle>聊天</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">加载中…</CardContent>
        </Card>
      }
    >
      <MallChatClient />
    </Suspense>
  )
}

function MallChatClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  const privatePeers = useChatStore((state) => state.privatePeers)
  const ensurePrivatePeer = useChatStore((state) => state.ensurePrivatePeer)
  const unreadByRoomId = useChatStore((state) => state.unreadByRoomId)
  const unreadByPeerId = useChatStore((state) => state.unreadByPeerId)
  const clearRoomUnread = useChatStore((state) => state.clearRoomUnread)
  const clearPeerUnread = useChatStore((state) => state.clearPeerUnread)
  const incrementRoomUnread = useChatStore((state) => state.incrementRoomUnread)
  const incrementPeerUnread = useChatStore((state) => state.incrementPeerUnread)
  const notificationsEnabled = useChatStore((state) => state.notificationsEnabled)
  const setNotificationsEnabled = useChatStore((state) => state.setNotificationsEnabled)
  const removePrivatePeer = useChatStore((state) => state.removePrivatePeer)

  const currentUserId = user?.id ?? ""

  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [threadMessages, setThreadMessages] = useState<UiMessage[]>([])
  const [roomMembers, setRoomMembers] = useState<Record<string, ChatUserSummary>>({})
  const [peerProfiles, setPeerProfiles] = useState<Record<string, ChatUserSummary>>({})
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [presenceUserIds, setPresenceUserIds] = useState<string[]>([])
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  const [createRoomOpen, setCreateRoomOpen] = useState(false)
  const [createRoomName, setCreateRoomName] = useState("")
  const [creatingRoom, setCreatingRoom] = useState(false)

  const [startPrivateOpen, setStartPrivateOpen] = useState(false)
  const [startPrivateId, setStartPrivateId] = useState("")

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const joinedRoomIds = useMemo(
    () => rooms.filter((room) => room.joined).map((room) => room.id).slice(0, 25),
    [rooms]
  )
  const joinedRoomIdsKey = useMemo(() => joinedRoomIds.join("|"), [joinedRoomIds])

  const runtimeRef = useRef<{
    activeThread: Thread | null
    rooms: ChatRoom[]
    notificationsEnabled: boolean
    notificationPermission: NotificationPermission
  }>({
    activeThread: null,
    rooms: [],
    notificationsEnabled: false,
    notificationPermission: "default",
  })

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api", [])

  useEffect(() => {
    if (!isHydrated) return
    if (!token) {
      router.replace("/mall/login")
    }
  }, [isHydrated, router, token])

  useEffect(() => {
    if (typeof Notification === "undefined") return
    setNotificationPermission(Notification.permission)
  }, [])

  useEffect(() => {
    runtimeRef.current = {
      activeThread,
      rooms,
      notificationsEnabled,
      notificationPermission,
    }
  }, [activeThread, rooms, notificationsEnabled, notificationPermission])

  useEffect(() => {
    if (!token) {
      return
    }

    const missing = privatePeers.filter((peerId) => !peerProfiles[peerId])
    if (missing.length === 0) {
      return
    }

    let cancelled = false

    const fetchPresence = async () => {
      try {
        const response = await chatApi.getPresence(missing.slice(0, 50))
        if (cancelled) {
          return
        }

        const mapped: Record<string, ChatUserSummary> = {}
        Object.entries(response.data ?? {}).forEach(([id, value]) => {
          if (!id) {
            return
          }
          const record = asRecord(value)
          const username = getString(record, "username", "")
          const avatar = getNullableString(record, "avatar")
          if (username) {
            mapped[id] = { id, username, avatar }
          }
        })

        if (Object.keys(mapped).length > 0) {
          setPeerProfiles((prev) => ({ ...prev, ...mapped }))
        }
      } catch {
        return
      }
    }

    void fetchPresence()

    return () => {
      cancelled = true
    }
  }, [peerProfiles, privatePeers, token])

  const refreshRooms = useCallback(
    async (options?: { preferThread?: Thread }) => {
      setLoadingRooms(true)
      try {
        const response = await chatApi.getRooms()
        const data = response.data ?? []
        setRooms(data)
        setActiveThread((current) => {
          if (options?.preferThread) {
            return options.preferThread
          }

          const urlRoomId = searchParams.get("roomId")
          if (urlRoomId && data.some((room) => room.id === urlRoomId)) {
            return { kind: "room", roomId: urlRoomId }
          }

          const urlPeerId = searchParams.get("peerId")
          if (urlPeerId) {
            return { kind: "private", peerId: urlPeerId }
          }

          if (current) {
            if (current.kind === "room" && data.some((room) => room.id === current.roomId)) {
              return current
            }
            if (current.kind === "private") {
              return current
            }
          }

          const firstJoined = data.find((room) => room.joined) ?? data[0]
          return firstJoined ? { kind: "room", roomId: firstJoined.id } : null
        })
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "加载房间列表失败"
        toast.error(message)
        setRooms([])
      } finally {
        setLoadingRooms(false)
      }
    },
    [searchParams]
  )

  useEffect(() => {
    if (!token) return
    void refreshRooms()
  }, [refreshRooms, token])

  useEffect(() => {
    if (!activeThread) {
      setThreadMessages([])
      setRoomMembers({})
      setPresenceUserIds([])
      return
    }

    if (activeThread.kind === "room") {
      clearRoomUnread(activeThread.roomId)
    } else {
      clearPeerUnread(activeThread.peerId)
      ensurePrivatePeer(activeThread.peerId)
    }
  }, [activeThread, clearPeerUnread, clearRoomUnread, ensurePrivatePeer])

  useEffect(() => {
    if (!activeThread || !token || !currentUserId) {
      setThreadMessages([])
      setRoomMembers({})
      setPresenceUserIds([])
      return
    }

    let cancelled = false
    setLoadingMessages(true)

    const load = async () => {
      try {
        if (activeThread.kind === "room") {
          const [history, members] = await Promise.all([
            chatApi.getHistory({ roomId: activeThread.roomId, take: 100 }),
            chatApi.getRoomMembers(activeThread.roomId),
          ])

          if (cancelled) return

          setThreadMessages((history.data ?? []).map(fromApiMessage))

          const mapped: Record<string, ChatUserSummary> = {}
          for (const item of members.data ?? []) {
            if (item.user?.id) {
              mapped[item.user.id] = item.user
            }
          }
          setRoomMembers(mapped)
          setPeerProfiles((prev) => ({ ...prev, ...mapped }))
        } else {
          const history = await chatApi.getHistory({
            senderId: currentUserId,
            receiverId: activeThread.peerId,
            take: 100,
          })

          if (cancelled) return

          const normalized = (history.data ?? []).map(fromApiMessage)
          setThreadMessages(normalized)

          const peer =
            normalized
              .map((msg) => {
                if (msg.sender?.id === activeThread.peerId) return msg.sender
                if (msg.receiver?.id === activeThread.peerId) return msg.receiver
                return null
              })
              .find(Boolean) ?? null

          if (peer?.id) {
            setPeerProfiles((prev) => ({ ...prev, [peer.id]: peer }))
          }

          const unread = normalized
            .filter((msg) => msg.receiverId === currentUserId && msg.isRead === false)
            .slice(-20)
            .map((msg) => msg.id)

          await Promise.allSettled(unread.map((id) => chatApi.markMessageRead(id)))
        }
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "加载消息失败"
        toast.error(message)
        if (!cancelled) {
          setThreadMessages([])
          setRoomMembers({})
          setPresenceUserIds([])
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [activeThread, currentUserId, token])

  const activeRoomIdForScroll = activeThread?.kind === "room" ? activeThread.roomId : ""
  const activePeerIdForScroll = activeThread?.kind === "private" ? activeThread.peerId : ""

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeThread?.kind, activeRoomIdForScroll, activePeerIdForScroll, threadMessages.length])

  useEffect(() => {
    if (!currentUserId || !token) {
      return
    }

    let cancelled = false
    let controller: AbortController | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    const handleIncoming = (message: UiMessage) => {
      if (!message.id || message.senderId === currentUserId) {
        return
      }

      const { activeThread, rooms, notificationsEnabled, notificationPermission } = runtimeRef.current
      const isRoom = Boolean(message.roomId)

      const isActive =
        activeThread?.kind === "room"
          ? Boolean(isRoom && message.roomId === activeThread.roomId)
          : activeThread?.kind === "private"
            ? Boolean(!isRoom && getPeerId(currentUserId, message) === activeThread.peerId)
            : false

      if (isActive) {
        setThreadMessages((prev) => (prev.some((msg) => msg.id === message.id) ? prev : [...prev, message]))
        if (!isRoom) {
          void chatApi.markMessageRead(message.id)
        }
        return
      }

      if (isRoom && message.roomId) {
        incrementRoomUnread(message.roomId)
      } else {
        const peerId = getPeerId(currentUserId, message)
        if (peerId) {
          ensurePrivatePeer(peerId)
          incrementPeerUnread(peerId)
        }
      }

      const shouldNotify = typeof document !== "undefined" && document.visibilityState !== "visible"
      if (!shouldNotify || !notificationsEnabled || notificationPermission !== "granted") {
        return
      }

      const roomName = message.roomId ? rooms.find((room) => room.id === message.roomId)?.roomName : null
      const peerId = getPeerId(currentUserId, message)
      const title = message.roomId ? `新消息 · ${roomName ?? "群聊"}` : `新消息 · ${peerId ? truncateId(peerId) : "私聊"}`
      const body = message.content.length > 60 ? `${message.content.slice(0, 60)}…` : message.content
      const notification = new Notification(title, { body })
      notification.onclick = () => {
        window.focus()
        if (message.roomId) router.push(`/mall/chat?roomId=${message.roomId}`)
        else if (peerId) router.push(`/mall/chat?peerId=${peerId}`)
        else router.push("/mall/chat")
        notification.close()
      }
    }

    const connect = async (attempt: number) => {
      if (cancelled) {
        return
      }

      controller?.abort()
      controller = new AbortController()

      const url = new URL(`${apiBaseUrl}/chat/stream`)
      url.searchParams.set("rooms", joinedRoomIdsKey)
      url.searchParams.set("t", String(Date.now()))

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`SSE连接失败(${response.status})`)
        }

        for await (const event of sseIterator(response.body, controller.signal)) {
          if (cancelled) {
            return
          }

          if (event.event === "presence") {
            try {
              const parsed = JSON.parse(event.data) as unknown
              const presence = asRecord(parsed)
              const roomId = getString(presence, "roomId") || getString(presence, "room_id")
              const users = presence.userIds ?? presence.user_ids
              if (roomId && Array.isArray(users)) {
                const ids = users.map((item) => String(item)).filter(Boolean)
                const active = runtimeRef.current.activeThread
                if (active?.kind === "room" && active.roomId === roomId) {
                  setPresenceUserIds(ids)
                }
              }
            } catch {
              continue
            }
            continue
          }

          if (event.event === "ping" || event.event === "keep-alive") {
            continue
          }

          let parsed: unknown = null
          try {
            parsed = JSON.parse(event.data)
          } catch {
            parsed = null
          }

          const message = toUiMessage(parsed)
          if (!message) {
            continue
          }

          handleIncoming(message)
        }
      } catch {
        if (cancelled) {
          return
        }

        const delay = Math.min(10000, Math.max(1000, attempt * 1000))
        reconnectTimer = setTimeout(() => {
          void connect(attempt + 1)
        }, delay)
      }
    }

    void connect(1)

    return () => {
      cancelled = true
      controller?.abort()
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
    }
  }, [
    currentUserId,
    ensurePrivatePeer,
    incrementPeerUnread,
    incrementRoomUnread,
    joinedRoomIdsKey,
    router,
    token,
    apiBaseUrl,
  ])

  const handleOpenCreateRoom = () => {
    if (!currentUserId) {
      toast.error("请先登录后创建房间")
      router.push("/mall/login")
      return
    }
    setCreateRoomName("")
    setCreateRoomOpen(true)
  }

  const handleCreateRoom = async () => {
    const roomName = createRoomName.trim()
    if (!roomName) {
      toast.error("请输入房间名称")
      return
    }
    if (!currentUserId) {
      toast.error("请先登录后创建房间")
      router.push("/mall/login")
      return
    }

    setCreatingRoom(true)
    try {
      const response = await chatApi.createRoom({ roomName })
      toast.success("房间已创建")
      setCreateRoomOpen(false)
      setCreateRoomName("")
      await refreshRooms({ preferThread: { kind: "room", roomId: response.data.id } })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "创建房间失败"
      toast.error(message)
    } finally {
      setCreatingRoom(false)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    if (!currentUserId) {
      toast.error("请先登录后加入房间")
      router.push("/mall/login")
      return
    }

    try {
      await chatApi.joinRoom(roomId)
      toast.success("已加入房间")
      await refreshRooms({ preferThread: { kind: "room", roomId } })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "加入房间失败"
      toast.error(message)
    }
  }

  const handleSend = async (content: string) => {
    if (!activeThread) return
    if (!currentUserId) {
      toast.error("请先登录后再发送消息")
      router.push("/mall/login")
      return
    }

    try {
      if (activeThread.kind === "room") {
        const response = await chatApi.sendRoomMessage({ roomId: activeThread.roomId, content })
        const message = fromApiMessage(response.data)
        setThreadMessages((prev) => {
          if (prev.some((msg) => msg.id === message.id)) {
            return prev
          }
          return [...prev, message]
        })
        return
      }

      const response = await chatApi.sendPrivateMessage({ receiverId: activeThread.peerId, content })
      const message = fromApiMessage(response.data)
      ensurePrivatePeer(activeThread.peerId)
      setThreadMessages((prev) => {
        if (prev.some((msg) => msg.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "发送失败"
      toast.error(message)
    }
  }

  const handleOpenStartPrivate = () => {
    if (!currentUserId) {
      toast.error("请先登录后发起私聊")
      router.push("/mall/login")
      return
    }

    setStartPrivateId("")
    setStartPrivateOpen(true)
  }

  const handleStartPrivate = () => {
    const peerId = startPrivateId.trim()
    if (!peerId) {
      toast.error("请输入对方用户ID")
      return
    }
    if (peerId === currentUserId) {
      toast.error("不能和自己私聊")
      return
    }

    ensurePrivatePeer(peerId)
    setActiveThread({ kind: "private", peerId })
    setStartPrivateOpen(false)
  }

  const activeTitle = useMemo(() => {
    if (!activeThread) return "请选择会话"
    if (activeThread.kind === "room") {
      return rooms.find((room) => room.id === activeThread.roomId)?.roomName ?? "群聊"
    }
    const peer = peerProfiles[activeThread.peerId]
    const name =
      peer?.username && peer.username !== "未登录" && !isUuidLike(peer.username) ? peer.username : "未设置昵称"
    return `私聊 · ${name}`
  }, [activeThread, peerProfiles, rooms])

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <Card className="rounded-[2rem] border-border/70">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle>聊天</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleOpenStartPrivate} disabled={!currentUserId}>
                私聊
              </Button>
              <Button size="sm" onClick={handleOpenCreateRoom} disabled={!currentUserId}>
                创建房间
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.username ? `当前用户：${user.username}` : "请先登录后使用聊天"}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Separator />
          <div className="grid gap-2">
            <div className="text-xs font-medium text-muted-foreground">群聊</div>
            {loadingRooms ? (
              <div className="text-sm text-muted-foreground">加载房间中…</div>
            ) : rooms.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无房间</div>
            ) : (
              <ChatRoomList
                rooms={rooms}
                activeRoomId={activeThread?.kind === "room" ? activeThread.roomId : null}
                onJoin={handleJoinRoom}
                getUnreadCount={(roomId) => unreadByRoomId[roomId] ?? 0}
                onSelect={(room) => {
                  if (!room.joined) {
                    void handleJoinRoom(room.id)
                    return
                  }
                  setActiveThread({ kind: "room", roomId: room.id })
                }}
              />
            )}
          </div>

          <Separator />

          <div className="grid gap-2">
            <div className="text-xs font-medium text-muted-foreground">私聊</div>
            {privatePeers.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无私聊会话</div>
            ) : (
              <div className="grid gap-1">
                {privatePeers.map((peerId) => {
                  const active = activeThread?.kind === "private" && activeThread.peerId === peerId
                  const unread = unreadByPeerId[peerId] ?? 0
                  const peer = peerProfiles[peerId] ?? null
                  const displayName =
                    peer?.username && peer.username !== "未登录" && !isUuidLike(peer.username) ? peer.username : "未设置昵称"
                  const initials = displayName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()

                  return (
                    <div
                      key={peerId}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-xl px-3 py-2 transition-colors",
                        active ? "bg-accent text-accent-foreground" : "hover:bg-accent/70"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveThread({ kind: "private", peerId })}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <Avatar size="sm">
                          <AvatarImage src={peer?.avatar ?? undefined} alt={displayName} className="dark:invert" />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{displayName}</div>
                          <div className="truncate text-xs text-muted-foreground">私聊</div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2">
                        {unread > 0 ? (
                          <Badge variant="secondary" className="h-5 rounded-full px-2">
                            {unread > 99 ? "99+" : unread}
                          </Badge>
                        ) : null}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className={cn("h-8 w-8", active ? "hover:bg-accent/60" : "")}
                              onClick={(event) => {
                                event.stopPropagation()
                              }}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={(event) => {
                                event.preventDefault()
                                removePrivatePeer(peerId)
                                if (activeThread?.kind === "private" && activeThread.peerId === peerId) {
                                  const nextRoom = rooms.find((room) => room.joined) ?? rooms[0] ?? null
                                  setActiveThread(nextRoom ? { kind: "room", roomId: nextRoom.id } : null)
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                              删除会话
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-border/70">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="truncate">{activeTitle}</CardTitle>
            <div className="flex items-center gap-2">
              {activeThread?.kind === "room" ? <Badge variant="secondary">{presenceUserIds.length} 在线</Badge> : null}
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (!notificationsEnabled) {
                    setNotificationsEnabled(true)
                    if (typeof Notification !== "undefined" && Notification.permission === "default") {
                      const result = await Notification.requestPermission()
                      setNotificationPermission(result)
                    }
                    return
                  }
                  setNotificationsEnabled(false)
                }}
              >
                {notificationsEnabled ? "通知开" : "通知关"}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">实时推送：SSE｜发送：后端 Chat API</div>
          {activeThread?.kind === "room" ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">成员：</span>
              {Object.values(roomMembers)
                .filter((member) => member.id !== currentUserId)
                .slice(0, 8)
                .map((member) => {
                  const isOnline = presenceUserIds.includes(member.id)
                  const label =
                    member.username && member.username !== "未登录" && !isUuidLike(member.username)
                      ? member.username
                      : "未设置昵称"

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        ensurePrivatePeer(member.id)
                        setActiveThread({ kind: "private", peerId: member.id })
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-2 py-1 text-xs hover:bg-accent"
                      title={`私聊：${label}`}
                    >
                      <span className={cn("size-2 rounded-full", isOnline ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                      <span className="truncate">{label}</span>
                    </button>
                  )
                })}
              <Button size="sm" variant="ghost" onClick={handleOpenStartPrivate} disabled={!currentUserId}>
                更多私聊
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4">
          <div
            className={cn(
              "h-[62vh] overflow-y-auto rounded-2xl border border-border/70 bg-background/60 p-4",
              loadingMessages ? "opacity-70" : ""
            )}
          >
            {loadingMessages ? (
              <div className="text-sm text-muted-foreground">加载消息中…</div>
            ) : threadMessages.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无消息</div>
            ) : (
              <div className="grid gap-4">
                {threadMessages.map((message) => {
                  const sender = message.sender ?? roomMembers[message.senderId] ?? null
                  return (
                    <ChatMessageBubble
                      key={message.id}
                      message={message}
                      sender={sender}
                      isOwn={Boolean(currentUserId && message.senderId === currentUserId)}
                      onStartPrivate={(userId) => {
                        if (!currentUserId || userId === currentUserId) {
                          return
                        }
                        ensurePrivatePeer(userId)
                        setActiveThread({ kind: "private", peerId: userId })
                      }}
                    />
                  )
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <ChatComposer
            disabled={!activeThread || !currentUserId}
            onSend={handleSend}
            placeholder={!activeThread ? "请选择会话" : "输入消息，回车发送"}
          />
        </CardContent>
      </Card>

      <Dialog open={createRoomOpen} onOpenChange={setCreateRoomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建房间</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="room-name">房间名称</Label>
            <Input
              id="room-name"
              value={createRoomName}
              placeholder="例如：售后支持 / 闲聊 / 项目群"
              onChange={(event) => setCreateRoomName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  void handleCreateRoom()
                }
              }}
              disabled={creatingRoom}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoomOpen(false)} disabled={creatingRoom}>
              取消
            </Button>
            <Button onClick={() => void handleCreateRoom()} disabled={creatingRoom || !createRoomName.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={startPrivateOpen} onOpenChange={setStartPrivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发起私聊</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="peer-id">对方用户ID</Label>
            <Input
              id="peer-id"
              value={startPrivateId}
              placeholder="UUID"
              onChange={(event) => setStartPrivateId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleStartPrivate()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartPrivateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleStartPrivate} disabled={!startPrivateId.trim()}>
              开始聊天
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
