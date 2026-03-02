'use client'

import { useState } from 'react'
import type { Newsletter, NewsletterSection, Quote } from '@/lib/newsletter-types'
import StepShell from '../stepper/StepShell'

interface Step4EditProps {
  newsletter: Newsletter
  onChange: (newsletter: Newsletter) => void
  onContinue: () => void
  onBack: () => void
}

type EditingField = null | 'title' | 'subtitle' | 'intro' | `section-${number}` | `quote-${number}` | `takeaway-${number}`

export default function Step4Edit({
  newsletter,
  onChange,
  onContinue,
  onBack,
}: Step4EditProps) {
  const [editing, setEditing] = useState<EditingField>(null)
  const [regeneratingField, setRegeneratingField] = useState<string | null>(null)

  function updateField<K extends keyof Newsletter>(key: K, value: Newsletter[K]) {
    onChange({ ...newsletter, [key]: value })
  }

  function updateSection(index: number, updated: NewsletterSection) {
    const sections = [...newsletter.sections]
    sections[index] = updated
    updateField('sections', sections)
  }

  function updateQuote(index: number, updated: Quote) {
    const quotes = [...newsletter.quotes]
    quotes[index] = updated
    updateField('quotes', quotes)
  }

  async function handleRegenerate(field: string, currentContent: string) {
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
        body: JSON.stringify({ field, currentContent, chatContext }),
      })

      if (response.ok) {
        const { content } = await response.json()
        if (field === 'title') updateField('title', content)
        else if (field === 'subtitle') updateField('subtitle', content)
        else if (field === 'intro') updateField('intro', content)
      }
    } catch (error) {
      console.error('Regeneration failed:', error)
    } finally {
      setRegeneratingField(null)
    }
  }

  return (
    <StepShell
      title="Edit Your Newsletter"
      subtitle="The AI has structured your conversation into a newsletter. Click any section to edit it, or hit the refresh button to get an alternative version."
      tip="Every section is editable — click the text to change it. The 'Regenerate' button asks the AI to write a fresh alternative. You can also remove sections or quotes you don't want."
    >
      <div className="space-y-4">
        {/* TITLE */}
        <EditableCard
          label="Title"
          isEditing={editing === 'title'}
          onToggleEdit={() => setEditing(editing === 'title' ? null : 'title')}
          onRegenerate={() => handleRegenerate('title', newsletter.title)}
          isRegenerating={regeneratingField === 'title'}
        >
          {editing === 'title' ? (
            <input
              type="text"
              value={newsletter.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full bg-transparent text-xl font-bold text-gray-900 focus:outline-none"
              autoFocus
            />
          ) : (
            <p className="text-xl font-bold text-gray-900">{newsletter.title}</p>
          )}
        </EditableCard>

        {/* SUBTITLE */}
        <EditableCard
          label="Subtitle"
          isEditing={editing === 'subtitle'}
          onToggleEdit={() => setEditing(editing === 'subtitle' ? null : 'subtitle')}
          onRegenerate={() => handleRegenerate('subtitle', newsletter.subtitle)}
          isRegenerating={regeneratingField === 'subtitle'}
        >
          {editing === 'subtitle' ? (
            <input
              type="text"
              value={newsletter.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className="w-full bg-transparent text-sm italic text-gray-600 focus:outline-none"
              autoFocus
            />
          ) : (
            <p className="text-sm italic text-gray-600">{newsletter.subtitle}</p>
          )}
        </EditableCard>

        {/* INTRO */}
        <EditableCard
          label="Introduction"
          isEditing={editing === 'intro'}
          onToggleEdit={() => setEditing(editing === 'intro' ? null : 'intro')}
          onRegenerate={() => handleRegenerate('intro', newsletter.intro)}
          isRegenerating={regeneratingField === 'intro'}
        >
          {editing === 'intro' ? (
            <textarea
              value={newsletter.intro}
              onChange={(e) => updateField('intro', e.target.value)}
              rows={4}
              className="w-full resize-y bg-transparent text-sm leading-relaxed text-gray-800 focus:outline-none"
              autoFocus
            />
          ) : (
            <p className="text-sm leading-relaxed text-gray-800">
              {newsletter.intro}
            </p>
          )}
        </EditableCard>

        {/* SECTIONS */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Sections ({newsletter.sections.length})
          </p>
          <div className="space-y-3">
            {newsletter.sections.map((section, i) => {
              const fieldKey: EditingField = `section-${i}`
              return (
                <EditableCard
                  key={i}
                  label={section.heading}
                  isEditing={editing === fieldKey}
                  onToggleEdit={() =>
                    setEditing(editing === fieldKey ? null : fieldKey)
                  }
                  onRemove={() => {
                    const sections = newsletter.sections.filter((_, j) => j !== i)
                    updateField('sections', sections)
                  }}
                >
                  {editing === fieldKey ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400">Heading</label>
                        <input
                          type="text"
                          value={section.heading}
                          onChange={(e) =>
                            updateSection(i, { ...section, heading: e.target.value })
                          }
                          className="mt-1 w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold focus:border-brand-400 focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Body</label>
                        <textarea
                          value={section.body}
                          onChange={(e) =>
                            updateSection(i, { ...section, body: e.target.value })
                          }
                          rows={5}
                          className="mt-1 w-full resize-y rounded border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed focus:border-brand-400 focus:outline-none"
                        />
                      </div>
                      {section.bulletPoints && section.bulletPoints.length > 0 && (
                        <div>
                          <label className="text-xs text-gray-400">Key Points</label>
                          {section.bulletPoints.map((point, k) => (
                            <div key={k} className="mt-1 flex items-center gap-2">
                              <span className="text-gray-300">&#8226;</span>
                              <input
                                type="text"
                                value={point}
                                onChange={(e) => {
                                  const bullets = [...(section.bulletPoints || [])]
                                  bullets[k] = e.target.value
                                  updateSection(i, { ...section, bulletPoints: bullets })
                                }}
                                className="flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm focus:border-brand-400 focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="mb-1 text-sm font-semibold text-gray-800">
                        {section.heading}
                      </p>
                      <p className="text-xs leading-relaxed text-gray-600 line-clamp-3">
                        {section.body}
                      </p>
                      {section.bulletPoints && section.bulletPoints.length > 0 && (
                        <p className="mt-1 text-[10px] text-gray-400">
                          {section.bulletPoints.length} key point{section.bulletPoints.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </EditableCard>
              )
            })}
          </div>
        </div>

        {/* QUOTES */}
        {newsletter.quotes.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Pull Quotes ({newsletter.quotes.length})
            </p>
            <div className="space-y-3">
              {newsletter.quotes.map((quote, i) => {
                const fieldKey: EditingField = `quote-${i}`
                return (
                  <EditableCard
                    key={i}
                    label={`"${quote.text.slice(0, 40)}..."`}
                    isEditing={editing === fieldKey}
                    onToggleEdit={() =>
                      setEditing(editing === fieldKey ? null : fieldKey)
                    }
                    onRemove={() => {
                      const quotes = newsletter.quotes.filter((_, j) => j !== i)
                      updateField('quotes', quotes)
                    }}
                  >
                    {editing === fieldKey ? (
                      <div className="space-y-2">
                        <textarea
                          value={quote.text}
                          onChange={(e) =>
                            updateQuote(i, { ...quote, text: e.target.value })
                          }
                          rows={2}
                          className="w-full resize-none rounded border border-gray-200 bg-gray-50 p-2 text-sm italic focus:border-brand-400 focus:outline-none"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={quote.attribution}
                          onChange={(e) =>
                            updateQuote(i, { ...quote, attribution: e.target.value })
                          }
                          className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus:border-brand-400 focus:outline-none"
                          placeholder="Attribution"
                        />
                      </div>
                    ) : (
                      <blockquote className="border-l-2 border-gray-200 pl-3">
                        <p className="text-sm italic text-gray-700">
                          &ldquo;{quote.text}&rdquo;
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          — {quote.attribution}
                        </p>
                      </blockquote>
                    )}
                  </EditableCard>
                )
              })}
            </div>
          </div>
        )}

        {/* TAKEAWAYS */}
        {newsletter.takeaways.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Takeaways ({newsletter.takeaways.length})
            </p>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              {newsletter.takeaways.map((t, i) => (
                <div key={i} className="mb-2 flex items-start gap-2 last:mb-0">
                  <span className="mt-0.5 text-gray-300">&#8226;</span>
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
                      const takeaways = newsletter.takeaways.filter((_, j) => j !== i)
                      updateField('takeaways', takeaways)
                    }}
                    className="text-xs text-gray-300 hover:text-red-500"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg px-4 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Continue to Images
        </button>
      </div>
    </StepShell>
  )
}

/* ─── Reusable editable card ────────────────────────────── */

function EditableCard({
  label,
  isEditing,
  onToggleEdit,
  onRegenerate,
  onRemove,
  isRegenerating,
  children,
}: {
  label: string
  isEditing: boolean
  onToggleEdit: () => void
  onRegenerate?: () => void
  onRemove?: () => void
  isRegenerating?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 transition ${
        isEditing ? 'border-brand-300 ring-2 ring-brand-50' : 'border-gray-200'
      }`}
    >
      {/* Toolbar */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {label.length > 30 ? label.slice(0, 30) + '...' : label}
        </span>
        <div className="flex items-center gap-1">
          {onRegenerate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRegenerate()
              }}
              disabled={isRegenerating}
              className="rounded px-2 py-1 text-[10px] text-brand-600 transition hover:bg-brand-50 disabled:opacity-50"
            >
              {isRegenerating ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-brand-600 border-t-transparent" />
                  Regenerating
                </span>
              ) : (
                '&#8635; Regenerate'
              )}
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="rounded px-2 py-1 text-[10px] text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            >
              Remove
            </button>
          )}
          <button
            onClick={onToggleEdit}
            className="rounded px-2 py-1 text-[10px] text-gray-500 transition hover:bg-gray-100"
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
