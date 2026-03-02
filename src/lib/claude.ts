import Anthropic from '@anthropic-ai/sdk'
import type { ParsedChat, Newsletter } from './newsletter-types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const NEWSLETTER_SYSTEM_PROMPT = `You are an expert newsletter editor. You transform WhatsApp group chat transcripts into polished, engaging newsletters formatted for Substack.

Your output should match the style of professional media newsletters — think Machine Cinema, Stratechery, or The Hustle. The newsletter should:
- Have a compelling, punchy title (under 80 characters)
- Have an evocative subtitle (one line, intriguing)
- Open with an engaging intro paragraph that frames the conversation's significance
- Break the conversation into thematic sections with clear headings
- Extract the most quotable, impactful statements as pull quotes
- Distill key takeaways into a crisp bulleted list
- Include any upcoming events or calls-to-action mentioned in the chat
- Be written in a professional but conversational tone

You MUST respond with valid JSON matching the Newsletter schema. Do not include markdown code fences around the JSON.`

const NEWSLETTER_SCHEMA = `{
  "title": "string - compelling newsletter title",
  "subtitle": "string - evocative one-liner subtitle",
  "publicationName": "string - publication name (infer from chat or use 'Newsletter')",
  "date": "string - date of the chat",
  "editedBy": "string - 'AI Editor' or infer from chat context",
  "intro": "string - engaging opening paragraph (2-4 sentences)",
  "sections": [
    {
      "heading": "string - section heading",
      "subheading": "string | null - optional subheading",
      "body": "string - section body in markdown",
      "bulletPoints": ["string - key points as bullets"] | null
    }
  ],
  "highlights": [
    {
      "speaker": "string | null - who said it",
      "topic": "string - topic area",
      "points": ["string - key highlight points"]
    }
  ],
  "quotes": [
    {
      "text": "string - the quote",
      "attribution": "string - who said it"
    }
  ],
  "takeaways": ["string - key takeaway bullet points"],
  "events": [
    {
      "title": "string - event name",
      "date": "string - event date",
      "time": "string - event time",
      "description": "string - event description",
      "guests": [{ "name": "string", "bio": "string" }] | null
    }
  ]
}`

export async function generateNewsletter(
  chat: ParsedChat
): Promise<Newsletter> {
  // Build a condensed version of the chat for the prompt
  const chatText = chat.messages
    .filter((m) => !m.isMedia)
    .map((m) => `[${m.timestamp}] ${m.sender}: ${m.content}`)
    .join('\n')

  // Truncate if extremely long (keep last ~100k chars to stay within limits)
  const maxChars = 100000
  const truncatedChat =
    chatText.length > maxChars
      ? '... [earlier messages truncated] ...\n' +
        chatText.slice(-maxChars)
      : chatText

  const userPrompt = `Here is a WhatsApp group chat transcript with ${chat.messageCount} messages from ${chat.participants.length} participants (${chat.participants.join(', ')}).

Date range: ${chat.dateRange.start} to ${chat.dateRange.end}

<chat_transcript>
${truncatedChat}
</chat_transcript>

Please transform this into a polished newsletter. Respond with JSON matching this schema:
${NEWSLETTER_SCHEMA}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: NEWSLETTER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  // Parse JSON — handle possible markdown fences
  const cleaned = text
    .replace(/^```json?\n?/gm, '')
    .replace(/\n?```$/gm, '')
    .trim()

  const newsletter: Newsletter = JSON.parse(cleaned)
  return newsletter
}

export async function regenerateSection(
  sectionType: string,
  currentContent: string,
  chatContext: string,
  instruction?: string
): Promise<string> {
  const prompt = `You are editing a newsletter section. The current ${sectionType} content is:

${currentContent}

Original chat context (abbreviated):
${chatContext.slice(0, 10000)}

${instruction ? `User instruction: ${instruction}` : 'Please provide an alternative version that is fresh and engaging.'}

Respond with ONLY the new content (no JSON wrapper, no explanation). If it's a list, use markdown bullet points.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
