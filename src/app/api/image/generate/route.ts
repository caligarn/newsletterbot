import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, context } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Nano Banana Pro via Gemini API
    const fullPrompt = context
      ? `Create a newsletter hero image for: "${context}". Style: ${prompt}`
      : prompt

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json(
        { error: 'Image generation failed' },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts || []
    const imagePart = parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
    )

    if (imagePart?.inlineData) {
      const { mimeType, data: base64 } = imagePart.inlineData
      const url = `data:${mimeType};base64,${base64}`
      return NextResponse.json({ url })
    }

    return NextResponse.json(
      { error: 'No image generated' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
