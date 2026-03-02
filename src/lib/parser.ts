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
  const lines = text.split('\n')
  const messages: ChatMessage[] = []

  // Match various WhatsApp timestamp formats
  const messagePattern =
    /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*[-–—]?\s*([^:]+):\s(.+)/

  // System messages (group created, user joined, etc.)
  const systemPattern =
    /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*[-–—]?\s*(.+)/

  let currentMessage: ChatMessage | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const match = trimmed.match(messagePattern)
    if (match) {
      // Save previous message
      if (currentMessage) {
        messages.push(currentMessage)
      }

      const [, date, time, sender, content] = match
      const isMedia =
        content.includes('<Media omitted>') ||
        content.includes('image omitted') ||
        content.includes('video omitted') ||
        content.includes('audio omitted') ||
        content.includes('sticker omitted') ||
        content.includes('document omitted') ||
        content.includes('.jpg') ||
        content.includes('.png') ||
        content.includes('.mp4')

      currentMessage = {
        timestamp: `${date} ${time}`,
        sender: sender.trim(),
        content: content.trim(),
        isMedia,
      }
    } else {
      // Continuation of previous message (multi-line)
      if (currentMessage && !systemPattern.test(trimmed)) {
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
