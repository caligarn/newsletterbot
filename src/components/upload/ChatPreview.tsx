'use client'

import { ParsedChat } from '@/lib/newsletter-types'
import { chatSummary } from '@/lib/parser'

interface ChatPreviewProps {
  parsed: ParsedChat
  onGenerate: () => void
  onClear: () => void
  isGenerating?: boolean
}

export default function ChatPreview({
  parsed,
  onGenerate,
  onClear,
  isGenerating,
}: ChatPreviewProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Summary bar */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Chat Preview
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Clear
        </button>
      </div>

      {/* Stats */}
      <p className="mb-4 text-sm text-gray-600">{chatSummary(parsed)}</p>

      {/* Participants */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          Participants
        </p>
        <div className="flex flex-wrap gap-2">
          {parsed.participants.map((name) => (
            <span
              key={name}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Message preview */}
      <div className="mb-6 max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-4">
        {parsed.messages.slice(0, 30).map((msg, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <span className="text-xs text-gray-400">{msg.timestamp}</span>
            <span className="ml-2 text-xs font-semibold text-gray-700">
              {msg.sender}:
            </span>
            <span className="ml-1 text-xs text-gray-600">
              {msg.isMedia ? (
                <em className="text-gray-400">[media]</em>
              ) : msg.content.length > 120 ? (
                msg.content.slice(0, 120) + '...'
              ) : (
                msg.content
              )}
            </span>
          </div>
        ))}
        {parsed.messages.length > 30 && (
          <p className="mt-2 text-center text-xs text-gray-400">
            ... and {parsed.messages.length - 30} more messages
          </p>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`
          w-full rounded-lg px-6 py-3 text-sm font-semibold text-white
          transition-all duration-200
          ${
            isGenerating
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-sm hover:shadow'
          }
        `}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating Newsletter...
          </span>
        ) : (
          'Generate Newsletter'
        )}
      </button>
    </div>
  )
}
