import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, formatChatTimestamp } from "@/lib/utils"
import type { ChatUserSummary } from "@/types/api"

type ChatMessageBubbleProps = {
  message: {
    senderId: string
    content: string
    sendTime: string
  }
  sender: ChatUserSummary | null
  isOwn: boolean
  onStartPrivate?: (userId: string) => void
}

export function ChatMessageBubble({ message, sender, isOwn, onStartPrivate }: ChatMessageBubbleProps) {
  const displayName = sender?.username ?? message.senderId.slice(0, 6)
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const canStartPrivate = Boolean(onStartPrivate && !isOwn)

  return (
    <div className={cn("flex items-end gap-2", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn ? (
        <button
          type="button"
          onClick={() => {
            if (canStartPrivate) {
              onStartPrivate?.(message.senderId)
            }
          }}
          className={cn(canStartPrivate ? "cursor-pointer" : "cursor-default")}
        >
          <Avatar size="sm">
            <AvatarImage src={sender?.avatar ?? undefined} alt={displayName} className="dark:invert" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      ) : null}

      <div className={cn("max-w-[78%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn ? (
          <button
            type="button"
            onClick={() => {
              if (canStartPrivate) {
                onStartPrivate?.(message.senderId)
              }
            }}
            className={cn(
              "mb-1 text-xs text-muted-foreground",
              canStartPrivate ? "hover:text-foreground" : "cursor-default"
            )}
          >
            {displayName}
          </button>
        ) : null}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm",
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          )}
        >
          <span className="whitespace-pre-wrap break-words">{message.content}</span>
        </div>
        <div className={cn("mt-1 text-[0.7rem] text-muted-foreground", isOwn ? "text-right" : "text-left")}>
          {formatChatTimestamp(message.sendTime)}
        </div>
      </div>
    </div>
  )
}
