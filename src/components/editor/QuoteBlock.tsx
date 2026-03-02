'use client'

import type { Quote } from '@/lib/newsletter-types'

interface QuoteBlockProps {
  quote: Quote
  onChange: (quote: Quote) => void
  onRemove: () => void
}

export default function QuoteBlock({
  quote,
  onChange,
  onRemove,
}: QuoteBlockProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-start justify-between">
        <span className="text-2xl leading-none text-gray-300">&ldquo;</span>
        <button
          onClick={onRemove}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          Remove
        </button>
      </div>
      <textarea
        value={quote.text}
        onChange={(e) => onChange({ ...quote, text: e.target.value })}
        rows={2}
        className="mb-2 w-full resize-none border-b border-gray-200 bg-transparent text-sm italic text-gray-700 focus:border-brand-400 focus:outline-none"
        placeholder="Quote text..."
      />
      <input
        type="text"
        value={quote.attribution}
        onChange={(e) => onChange({ ...quote, attribution: e.target.value })}
        className="w-full bg-transparent text-xs text-gray-500 focus:outline-none"
        placeholder="— Attribution"
      />
    </div>
  )
}
