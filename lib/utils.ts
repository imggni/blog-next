import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function formatChatTimestamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  const now = new Date()
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const time = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)

  if (isSameDay) {
    return time
  }

  const day = new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(date)

  return `${day} ${time}`
}

export function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
}

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; content: string }
  | { type: "paragraph"; content: string }
  | { type: "list"; items: string[] }
  | { type: "code"; content: string }

export function parseMarkdown(content: string): MarkdownBlock[] {
  const lines = content.split("\n")
  const blocks: MarkdownBlock[] = []

  let paragraphBuffer: string[] = []
  let listBuffer: string[] = []
  let codeBuffer: string[] = []
  let inCodeBlock = false

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({
        type: "paragraph",
        content: paragraphBuffer.join(" "),
      })
      paragraphBuffer = []
    }
  }

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({
        type: "list",
        items: [...listBuffer],
      })
      listBuffer = []
    }
  }

  const flushCode = () => {
    if (codeBuffer.length > 0) {
      blocks.push({
        type: "code",
        content: codeBuffer.join("\n"),
      })
      codeBuffer = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (line.startsWith("```")) {
      flushParagraph()
      flushList()

      if (inCodeBlock) {
        flushCode()
      }

      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine)
      continue
    }

    if (!line.trim()) {
      flushParagraph()
      flushList()
      continue
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/)

    if (headingMatch) {
      flushParagraph()
      flushList()
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        content: headingMatch[2],
      })
      continue
    }

    if (line.startsWith("- ")) {
      flushParagraph()
      listBuffer.push(line.slice(2))
      continue
    }

    paragraphBuffer.push(line)
  }

  flushParagraph()
  flushList()
  flushCode()

  return blocks
}
