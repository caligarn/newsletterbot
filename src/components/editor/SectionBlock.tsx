'use client'

import { useState } from 'react'
import type { NewsletterSection } from '@/lib/newsletter-types'

interface SectionBlockProps {
  section: NewsletterSection
  onChange: (section: NewsletterSection) => void
  onRemove: () => void
}

export default function SectionBlock({
  section,
  onChange,
  onRemove,
}: SectionBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header — always visible */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-800">
            {section.heading || 'Untitled Section'}
          </h4>
          {section.subheading && (
            <p className="text-xs text-gray-500">{section.subheading}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            Remove
          </button>
          <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded edit form */}
      {isExpanded && (
        <div className="space-y-3 border-t border-gray-100 p-4">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Heading</label>
            <input
              type="text"
              value={section.heading}
              onChange={(e) =>
                onChange({ ...section, heading: e.target.value })
              }
              className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold focus:border-brand-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">
              Subheading (optional)
            </label>
            <input
              type="text"
              value={section.subheading || ''}
              onChange={(e) =>
                onChange({ ...section, subheading: e.target.value || undefined })
              }
              className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-brand-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Body</label>
            <textarea
              value={section.body}
              onChange={(e) => onChange({ ...section, body: e.target.value })}
              rows={6}
              className="w-full resize-y rounded border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed focus:border-brand-400 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Bullet points */}
          {section.bulletPoints && section.bulletPoints.length > 0 && (
            <div>
              <label className="mb-1 block text-xs text-gray-400">
                Bullet Points
              </label>
              {section.bulletPoints.map((point, i) => (
                <div key={i} className="mb-1 flex items-start gap-2">
                  <span className="mt-2 text-gray-400">&#8226;</span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const bullets = [...(section.bulletPoints || [])]
                      bullets[i] = e.target.value
                      onChange({ ...section, bulletPoints: bullets })
                    }}
                    className="flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm focus:border-brand-400 focus:bg-white focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const bullets = (section.bulletPoints || []).filter(
                        (_, j) => j !== i
                      )
                      onChange({ ...section, bulletPoints: bullets })
                    }}
                    className="px-1 text-xs text-gray-400 hover:text-red-500"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
