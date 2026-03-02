import { NextRequest, NextResponse } from 'next/server'
import { parseWhatsAppChat } from '@/lib/parser'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const text: string = body.text

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const parsed = parseWhatsAppChat(text)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse chat' },
      { status: 500 }
    )
  }
}
