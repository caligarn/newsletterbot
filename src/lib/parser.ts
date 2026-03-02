import { ParsedChat, ChatMessage } from './newsletter-types'

// Unicode invisible / directional characters that WhatsApp embeds in exports
const INVISIBLE_CHARS_RE =
  /^[\u200e\u200f\u200b\u200c\u200d\u2060\u2066\u2067\u2068\u2069\u202a\u202b\u202c\u202d\u202e\ufeff]+/

/**
 * Parses a WhatsApp chat export (.txt file) and returns only messages
 * from the last 7 days of conversation found in the data.
 *
 * Supports common formats:
 *   [MM/DD/YY, HH:MM:SS AM] Name: Message
 *   MM/DD/YY, HH:MM - Name: Message
 *   [DD/MM/YYYY, HH:MM:SS] Name: Message
 *   [YYYY-MM-DD, HH:MM:SS] Name: Message
 *   DD.MM.YY, HH:MM - Name: Message
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

    // Strip invisible Unicode characters (LTR marks, etc.) from start of line
    const stripped = trimmed.replace(INVISIBLE_CHARS_RE, '')

    // Try each message pattern
    let matched = false
    for (const pattern of messagePatterns) {
      const match = stripped.match(pattern)
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
      const isSystem = systemPatterns.some((p) => p.test(stripped))
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

  // Filter to only the last 7 days of conversation
  const filtered = filterToLastWeek(messages)

  // Extract metadata from filtered messages
  const participants = [...new Set(filtered.map((m) => m.sender))]
  const mediaCount = filtered.filter((m) => m.isMedia).length

  let dateRange = { start: '', end: '' }
  if (filtered.length > 0) {
    dateRange = {
      start: filtered[0].timestamp,
      end: filtered[filtered.length - 1].timestamp,
    }
  }

  return {
    messages: filtered,
    participants,
    dateRange,
    messageCount: filtered.length,
    mediaCount,
  }
}

/**
 * Parses a WhatsApp timestamp string into a Date object.
 * Handles: "11/15/25 10:52:56 AM", "01/15/2025 14:30:00",
 *          "2025-01-15 14:30:00", "15.01.25 14:30"
 */
export function parseTimestamp(ts: string): Date | null {
  // Normalize Unicode whitespace (narrow no-break space, non-breaking space)
  const norm = ts.replace(/[\u202f\u00a0]/g, ' ')

  // MM/DD/YY or MM/DD/YYYY
  let match = norm.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([APap][Mm])?/
  )
  if (match) {
    const [, monthStr, dayStr, yearStr, hourStr, minStr, secStr, ampm] = match
    let year = parseInt(yearStr)
    if (year < 100) year += 2000
    let hours = parseInt(hourStr)
    if (ampm) {
      const upper = ampm.toUpperCase()
      if (upper === 'PM' && hours !== 12) hours += 12
      if (upper === 'AM' && hours === 12) hours = 0
    }
    return new Date(
      year,
      parseInt(monthStr) - 1,
      parseInt(dayStr),
      hours,
      parseInt(minStr),
      parseInt(secStr || '0')
    )
  }

  // ISO: YYYY-MM-DD
  match = norm.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([APap][Mm])?/
  )
  if (match) {
    const [, yearStr, monthStr, dayStr, hourStr, minStr, secStr, ampm] = match
    let hours = parseInt(hourStr)
    if (ampm) {
      const upper = ampm.toUpperCase()
      if (upper === 'PM' && hours !== 12) hours += 12
      if (upper === 'AM' && hours === 12) hours = 0
    }
    return new Date(
      parseInt(yearStr),
      parseInt(monthStr) - 1,
      parseInt(dayStr),
      hours,
      parseInt(minStr),
      parseInt(secStr || '0')
    )
  }

  // DD.MM.YY or DD.MM.YYYY (period-separated)
  match = norm.match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([APap][Mm])?/
  )
  if (match) {
    const [, dayStr, monthStr, yearStr, hourStr, minStr, secStr, ampm] = match
    let year = parseInt(yearStr)
    if (year < 100) year += 2000
    let hours = parseInt(hourStr)
    if (ampm) {
      const upper = ampm.toUpperCase()
      if (upper === 'PM' && hours !== 12) hours += 12
      if (upper === 'AM' && hours === 12) hours = 0
    }
    return new Date(
      year,
      parseInt(monthStr) - 1,
      parseInt(dayStr),
      hours,
      parseInt(minStr),
      parseInt(secStr || '0')
    )
  }

  return null
}

/**
 * Filters messages to only those within the last 7 days of the conversation.
 * The cutoff is calculated from the latest message timestamp in the data.
 */
function filterToLastWeek(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length === 0) return messages

  // Find the latest timestamp in the conversation
  let latestDate: Date | null = null
  for (const msg of messages) {
    const date = parseTimestamp(msg.timestamp)
    if (date && (!latestDate || date > latestDate)) {
      latestDate = date
    }
  }

  if (!latestDate) return messages

  // 7 days before the latest message
  const cutoff = new Date(latestDate.getTime() - 7 * 24 * 60 * 60 * 1000)

  return messages.filter((msg) => {
    const date = parseTimestamp(msg.timestamp)
    return date ? date >= cutoff : false
  })
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
