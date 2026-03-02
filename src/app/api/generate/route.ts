import { NextRequest, NextResponse } from 'next/server'
import { generateNewsletter } from '@/lib/claude'
import type { ParsedChat } from '@/lib/newsletter-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const chat: ParsedChat = body.chat

    if (!chat || !chat.messages || chat.messages.length === 0) {
      return NextResponse.json(
        { error: 'No chat data provided' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    const newsletter = await generateNewsletter(chat)
    return NextResponse.json(newsletter)
  } catch (error) {
    console.error('Newsletter generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate newsletter' },
      { status: 500 }
    )
  }
}
