import { NextRequest, NextResponse } from 'next/server'
import { toMarkdown } from '@/lib/export'
import type { Newsletter } from '@/lib/newsletter-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newsletter: Newsletter = body.newsletter

    if (!newsletter) {
      return NextResponse.json(
        { error: 'No newsletter data provided' },
        { status: 400 }
      )
    }

    const markdownContent = toMarkdown(newsletter)

    // Try NotebookLM Podcast API if configured
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
    if (projectId) {
      try {
        const podcastUrl = await generateWithNotebookLM(
          markdownContent,
          projectId
        )
        return NextResponse.json({ podcastUrl })
      } catch (error) {
        console.error('NotebookLM API failed, falling back to script:', error)
      }
    }

    // Fallback: generate podcast script via Claude
    const script = await generatePodcastScript(markdownContent)
    return NextResponse.json({ script })
  } catch (error) {
    console.error('Podcast generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate podcast' },
      { status: 500 }
    )
  }
}

async function generateWithNotebookLM(
  content: string,
  projectId: string
): Promise<string> {
  // NotebookLM Enterprise Podcast API
  // Requires allowlist access — see https://cloud.google.com/notebooklm/docs
  const endpoint = `https://notebooklm.googleapis.com/v1/projects/${projectId}/locations/global/podcasts`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      contexts: [
        {
          content: { text: content },
          display_name: 'Newsletter Content',
        },
      ],
      podcast_config: {
        style: 'conversational',
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`NotebookLM API returned ${response.status}`)
  }

  const data = await response.json()

  // The API returns an operation — poll until complete
  if (data.name) {
    return await pollPodcastOperation(data.name)
  }

  throw new Error('Unexpected NotebookLM response format')
}

async function pollPodcastOperation(operationName: string): Promise<string> {
  const maxAttempts = 30
  const pollInterval = 10000 // 10 seconds

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval))

    const response = await fetch(
      `https://notebooklm.googleapis.com/v1/${operationName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
        },
      }
    )

    if (!response.ok) continue

    const data = await response.json()
    if (data.done && data.response?.podcast?.audio_uri) {
      return data.response.podcast.audio_uri
    }
  }

  throw new Error('Podcast generation timed out')
}

async function generatePodcastScript(content: string): Promise<string> {
  // Fallback: use Claude to generate a podcast script
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Convert this newsletter into a natural, engaging podcast script between two hosts (Host A and Host B). Make it conversational, with natural transitions, reactions, and commentary. Include an intro and outro.

Newsletter content:
${content}

Format the output as a plain text script with speaker labels like:
HOST A: ...
HOST B: ...`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
