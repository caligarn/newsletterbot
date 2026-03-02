import { ParsedChat, ChatMessage } from './newsletter-types'

/**
 * Parses a WhatsApp chat export (.txt file).
 *
 * Supports common formats:
 *   [MM/DD/YY, HH:MM:SS] Name: Message
 *   MM/DD/YY, HH:MM - Name: Message
 *   [DD/MM/YYYY, HH:MM:SS] Name: Message
 */
export function parseWhatsAppChat(text: string): ParsedChat {
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  // Strip BOM if present
  const clean = normalized.replace(/^\uFEFF/, '')
  const lines = clean.split('\n')
  const messages: ChatMessage[] = []

  // Match many WhatsApp timestamp formats:
  //   [1/1/25, 12:00:00 AM] Name: message          (iOS brackets, 12h)
  //   [01/01/2025, 12:00:00] Name: message          (iOS brackets, 24h)
  //   1/1/25, 12:00 AM - Name: message              (Android, 12h, dash)
  //   01/01/2025, 12:00 - Name: message              (Android, 24h, dash)
  //   [2025-01-01, 12:00:00] Name: message           (ISO format)
  //   1/1/25, 12:00:00 PM - Name: message            (Android with seconds)
  const messagePatterns = [
    // Bracketed: [date, time] Name: message
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]\s+([^:]+):\s(.+)/,
    // Unbracketed with dash: date, time - Name: message
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s+[-–—]\s+([^:]+):\s(.+)/,
    // ISO bracketed: [YYYY-MM-DD, time] Name: message
    /^\[(\d{4}-\d{2}-\d{2}),\s+(\d{1,2}:\d{2}(?::\d{2})?)\]\s+([^:]+):\s(.+)/,
    // Period-separated dates: DD.MM.YY, time - Name: message
    /^(\d{1,2}\.\d{1,2}\.\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+[-–—]\s+([^:]+):\s(.+)/,
  ]

  // System message detection (no sender:message pattern)
  const systemPatterns = [
    /^\[?\d{1,4}[\/.:-]\d{1,2}[\/.:-]\d{2,4},\s+\d{1,2}:\d{2}/,
  ]

  let currentMessage: ChatMessage | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Try each message pattern
    let matched = false
    for (const pattern of messagePatterns) {
      const match = trimmed.match(pattern)
      if (match) {
        // Save previous message
        if (currentMessage) {
          messages.push(currentMessage)
        }

        const [, date, time, sender, content] = match
        const isMedia =
          content.includes('<Media omitted>') ||
          content.includes('media omitted') ||
          content.includes('image omitted') ||
          content.includes('video omitted') ||
          content.includes('audio omitted') ||
          content.includes('sticker omitted') ||
          content.includes('document omitted') ||
          content.includes('GIF omitted') ||
          content.includes('<attached:') ||
          /\.(jpg|jpeg|png|gif|mp4|opus|pdf|webp)/.test(content.toLowerCase())

        currentMessage = {
          timestamp: `${date} ${time}`,
          sender: sender.trim(),
          content: content.trim(),
          isMedia,
        }
        matched = true
        break
      }
    }

    if (!matched) {
      // Check if it's a system message (timestamp but no sender:message)
      const isSystem = systemPatterns.some((p) => p.test(trimmed))
      // If it's not a system message, treat as continuation of previous message
      if (currentMessage && !isSystem) {
        currentMessage.content += '\n' + trimmed
      }
    }
  }

  // Push the last message
  if (currentMessage) {
    messages.push(currentMessage)
  }

  // Extract metadata
  const participants = [...new Set(messages.map((m) => m.sender))]
  const mediaCount = messages.filter((m) => m.isMedia).length

  let dateRange = { start: '', end: '' }
  if (messages.length > 0) {
    dateRange = {
      start: messages[0].timestamp,
      end: messages[messages.length - 1].timestamp,
    }
  }

  return {
    messages,
    participants,
    dateRange,
    messageCount: messages.length,
    mediaCount,
  }
}

/**
 * Summarizes a parsed chat for display in the preview.
 */
export function chatSummary(parsed: ParsedChat): string {
  const parts = [
    `${parsed.messageCount} messages`,
    `${parsed.participants.length} participants`,
    `${parsed.mediaCount} media files`,
  ]
  if (parsed.dateRange.start && parsed.dateRange.end) {
    parts.push(`from ${parsed.dateRange.start} to ${parsed.dateRange.end}`)
  }
  return parts.join(' · ')
}
