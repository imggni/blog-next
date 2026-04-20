import { useCallback, useState } from "react"
import { SendHorizonal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChatComposerProps = {
  disabled?: boolean
  placeholder?: string
  onSend: (content: string) => Promise<void> | void
}

export function ChatComposer({ disabled, placeholder, onSend }: ChatComposerProps) {
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)

  const handleSend = useCallback(async () => {
    const content = value.trim()
    if (!content || disabled || sending) {
      return
    }

    setSending(true)
    try {
      await onSend(content)
      setValue("")
    } finally {
      setSending(false)
    }
  }, [disabled, onSend, sending, value])

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        placeholder={placeholder ?? "输入消息，回车发送"}
        disabled={disabled || sending}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            void handleSend()
          }
        }}
      />
      <Button onClick={() => void handleSend()} disabled={disabled || sending || !value.trim()}>
        <SendHorizonal className="size-4" />
      </Button>
    </div>
  )
}
