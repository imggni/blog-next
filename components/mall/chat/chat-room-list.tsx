import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatRoom } from "@/types/api"

type ChatRoomListProps = {
  rooms: ChatRoom[]
  activeRoomId: string | null
  onSelect: (room: ChatRoom) => void
  onJoin?: (roomId: string) => void
  getUnreadCount?: (roomId: string) => number
}

export function ChatRoomList({ rooms, activeRoomId, onSelect, onJoin, getUnreadCount }: ChatRoomListProps) {
  return (
    <div className="grid gap-1">
      {rooms.map((room) => {
        const active = room.id === activeRoomId
        const unread = getUnreadCount ? getUnreadCount(room.id) : 0
        return (
          <div
            key={room.id}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl px-3 py-2 transition-colors",
              active ? "bg-accent text-accent-foreground" : "hover:bg-accent/70"
            )}
          >
            <button type="button" onClick={() => onSelect(room)} className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-medium">{room.roomName}</div>
                {room.isPrivate ? <Badge variant="secondary">私密</Badge> : null}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{room.memberCount} 人</span>
                <span>{room.joined ? "已加入" : "未加入"}</span>
              </div>
            </button>

            <div className="flex items-center gap-2">
              {unread > 0 ? (
                <Badge variant="secondary" className="h-5 rounded-full px-2">
                  {unread > 99 ? "99+" : unread}
                </Badge>
              ) : null}
              {!room.joined && onJoin ? (
                <Button size="sm" variant="outline" onClick={() => onJoin(room.id)}>
                  加入
                </Button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
