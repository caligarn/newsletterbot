'use client'

import { useState } from 'react'
import type { Newsletter } from '@/lib/newsletter-types'
import { toSubstackHTML, toMarkdown } from '@/lib/export'

interface ExportPanelProps {
  newsletter: Newsletter
}

export default function ExportPanel({ newsletter }: ExportPanelProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [podcastStatus, setPodcastStatus] = useState<
    'idle' | 'generating' | 'done' | 'error'
  >('idle')

  async function copySubstackHTML() {
    const html = toSubstackHTML(newsletter)
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
      ])
      setCopied('substack')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback: copy as plain text
      await navigator.clipboard.writeText(html)
      setCopied('substack')
      setTimeout(() => setCopied(null), 2000)
    }
  }

  function downloadMarkdown() {
    const md = toMarkdown(newsletter)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${newsletter.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
    setCopied('markdown')
    setTimeout(() => setCopied(null), 2000)
  }

  async function generatePodcast() {
    setPodcastStatus('generating')
    try {
      const response = await fetch('/api/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletter }),
      })

      if (!response.ok) throw new Error('Podcast generation failed')

      const data = await response.json()
      if (data.podcastUrl) {
        setPodcastStatus('done')
      } else if (data.script) {
        // Fallback: download script
        const blob = new Blob([data.script], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'podcast-script.txt'
        a.click()
        URL.revokeObjectURL(url)
        setPodcastStatus('done')
      }
    } catch {
      setPodcastStatus('error')
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Export
      </h3>

      <div className="space-y-2">
        {/* Copy for Substack */}
        <button
          onClick={copySubstackHTML}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm transition hover:bg-gray-50"
        >
          <div>
            <p className="font-medium text-gray-800">Copy for Substack</p>
            <p className="text-xs text-gray-500">
              Copies formatted HTML — paste directly into Substack editor
            </p>
          </div>
          <span className="text-sm text-brand-600">
            {copied === 'substack' ? 'Copied!' : 'Copy'}
          </span>
        </button>

        {/* Download Markdown */}
        <button
          onClick={downloadMarkdown}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm transition hover:bg-gray-50"
        >
          <div>
            <p className="font-medium text-gray-800">Download Markdown</p>
            <p className="text-xs text-gray-500">
              Clean .md file for any platform
            </p>
          </div>
          <span className="text-sm text-brand-600">
            {copied === 'markdown' ? 'Downloaded!' : 'Download'}
          </span>
        </button>

        {/* Generate Podcast */}
        <button
          onClick={generatePodcast}
          disabled={podcastStatus === 'generating'}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          <div>
            <p className="font-medium text-gray-800">Generate Podcast</p>
            <p className="text-xs text-gray-500">
              Uses NotebookLM to create an audio discussion
            </p>
          </div>
          <span className="text-sm text-brand-600">
            {podcastStatus === 'generating'
              ? 'Generating...'
              : podcastStatus === 'done'
                ? 'Done!'
                : podcastStatus === 'error'
                  ? 'Failed'
                  : 'Generate'}
          </span>
        </button>
      </div>
    </div>
  )
}
