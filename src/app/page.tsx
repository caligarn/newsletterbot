'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DropZone from '@/components/upload/DropZone'
import ChatPreview from '@/components/upload/ChatPreview'
import { parseWhatsAppChat } from '@/lib/parser'
import type { ParsedChat } from '@/lib/newsletter-types'

export default function Home() {
  const router = useRouter()
  const [parsedChat, setParsedChat] = useState<ParsedChat | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileAccepted(text: string) {
    setIsParsing(true)
    setError(null)

    try {
      const parsed = parseWhatsAppChat(text)

      if (parsed.messages.length === 0) {
        setError(
          'No messages found. Make sure this is a WhatsApp chat export (.txt file).'
        )
        setIsParsing(false)
        return
      }

      setParsedChat(parsed)
    } catch {
      setError('Failed to parse the chat file. Please try again.')
    } finally {
      setIsParsing(false)
    }
  }

  async function handleGenerate() {
    if (!parsedChat) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: parsedChat }),
      })

      if (!response.ok) {
        throw new Error('Newsletter generation failed')
      }

      const newsletter = await response.json()

      // Store in sessionStorage for the editor page
      sessionStorage.setItem('newsletter', JSON.stringify(newsletter))
      sessionStorage.setItem('parsedChat', JSON.stringify(parsedChat))

      router.push('/editor')
    } catch {
      setError('Failed to generate newsletter. Check your API key and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  function handleClear() {
    setParsedChat(null)
    setError(null)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          WhatsApp to Newsletter
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Drop a WhatsApp chat export and generate a polished Substack-ready
          newsletter with AI-powered titles, summaries, and images.
        </p>
      </div>

      <DropZone onFileAccepted={handleFileAccepted} isLoading={isParsing} />

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {parsedChat && (
        <div className="mt-6">
          <ChatPreview
            parsed={parsedChat}
            onGenerate={handleGenerate}
            onClear={handleClear}
            isGenerating={isGenerating}
          />
        </div>
      )}
    </div>
  )
}
