'use client'

import { useState } from 'react'
import type { Newsletter } from '@/lib/newsletter-types'
import TitleSection from './TitleSection'
import IntroSection from './IntroSection'
import SectionBlock from './SectionBlock'
import QuoteBlock from './QuoteBlock'
import ExportPanel from '../export/ExportPanel'

interface NewsletterEditorProps {
  newsletter: Newsletter
  onChange: (newsletter: Newsletter) => void
}

export default function NewsletterEditor({
  newsletter,
  onChange,
}: NewsletterEditorProps) {
  const [regeneratingField, setRegeneratingField] = useState<string | null>(
    null
  )

  async function handleRegenerate(
    field: string,
    currentContent: string
  ) {
    setRegeneratingField(field)
    try {
      const chatData = sessionStorage.getItem('parsedChat')
      const chatContext = chatData
        ? JSON.parse(chatData)
            .messages.slice(0, 50)
            .map((m: { sender: string; content: string }) => `${m.sender}: ${m.content}`)
            .join('\n')
        : ''

      const response = await fetch('/api/generate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          currentContent,
          chatContext,
        }),
      })

      if (response.ok) {
        const { content } = await response.json()
        // Apply the regenerated content to the appropriate field
        const updated = { ...newsletter }
        if (field === 'title') updated.title = content
        else if (field === 'subtitle') updated.subtitle = content
        else if (field === 'intro') updated.intro = content
        onChange(updated)
      }
    } catch (error) {
      console.error('Regeneration failed:', error)
    } finally {
      setRegeneratingField(null)
    }
  }

  function updateField<K extends keyof Newsletter>(
    key: K,
    value: Newsletter[K]
  ) {
    onChange({ ...newsletter, [key]: value })
  }

  return (
    <div className="space-y-6">
      <TitleSection
        title={newsletter.title}
        subtitle={newsletter.subtitle}
        onTitleChange={(v) => updateField('title', v)}
        onSubtitleChange={(v) => updateField('subtitle', v)}
        onRegenerateTitle={() =>
          handleRegenerate('title', newsletter.title)
        }
        onRegenerateSubtitle={() =>
          handleRegenerate('subtitle', newsletter.subtitle)
        }
        isRegenerating={
          regeneratingField === 'title' || regeneratingField === 'subtitle'
        }
      />

      <IntroSection
        intro={newsletter.intro}
        onChange={(v) => updateField('intro', v)}
        onRegenerate={() =>
          handleRegenerate('intro', newsletter.intro)
        }
        isRegenerating={regeneratingField === 'intro'}
      />

      {/* Sections */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Sections
        </h3>
        {newsletter.sections.map((section, i) => (
          <SectionBlock
            key={i}
            section={section}
            onChange={(updated) => {
              const sections = [...newsletter.sections]
              sections[i] = updated
              updateField('sections', sections)
            }}
            onRemove={() => {
              const sections = newsletter.sections.filter((_, j) => j !== i)
              updateField('sections', sections)
            }}
          />
        ))}
      </div>

      {/* Quotes */}
      {newsletter.quotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Quotes
          </h3>
          {newsletter.quotes.map((quote, i) => (
            <QuoteBlock
              key={i}
              quote={quote}
              onChange={(updated) => {
                const quotes = [...newsletter.quotes]
                quotes[i] = updated
                updateField('quotes', quotes)
              }}
              onRemove={() => {
                const quotes = newsletter.quotes.filter((_, j) => j !== i)
                updateField('quotes', quotes)
              }}
            />
          ))}
        </div>
      )}

      {/* Takeaways */}
      {newsletter.takeaways.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Takeaways
          </h3>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            {newsletter.takeaways.map((t, i) => (
              <div key={i} className="mb-2 flex items-start gap-2">
                <span className="mt-1 text-gray-400">&#8226;</span>
                <input
                  type="text"
                  value={t}
                  onChange={(e) => {
                    const takeaways = [...newsletter.takeaways]
                    takeaways[i] = e.target.value
                    updateField('takeaways', takeaways)
                  }}
                  className="flex-1 border-b border-transparent bg-transparent text-sm text-gray-800 focus:border-brand-300 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const takeaways = newsletter.takeaways.filter(
                      (_, j) => j !== i
                    )
                    updateField('takeaways', takeaways)
                  }}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <ExportPanel newsletter={newsletter} />
    </div>
  )
}
