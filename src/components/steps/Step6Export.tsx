'use client'

import { useState } from 'react'
import type { Newsletter } from '@/lib/newsletter-types'
import NewsletterPreview from '../preview/NewsletterPreview'
import { toSubstackHTML, toMarkdown } from '@/lib/export'
import StepShell from '../stepper/StepShell'

interface Step6ExportProps {
  newsletter: Newsletter
  onBack: () => void
  onStartOver: () => void
}

export default function Step6Export({
  newsletter,
  onBack,
  onStartOver,
}: Step6ExportProps) {
  const [copied, setCopied] = useState(false)
  const [podcastStatus, setPodcastStatus] = useState<
    'idle' | 'generating' | 'done' | 'error'
  >('idle')
  const [podcastScript, setPodcastScript] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  async function copyForSubstack() {
    const html = toSubstackHTML(newsletter)
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
      ])
    } catch {
      await navigator.clipboard.writeText(html)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
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
  }

  async function generatePodcast() {
    setPodcastStatus('generating')
    try {
      const response = await fetch('/api/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletter }),
      })

      if (!response.ok) throw new Error('Failed')

      const data = await response.json()
      if (data.podcastUrl) {
        setPodcastStatus('done')
      } else if (data.script) {
        setPodcastScript(data.script)
        setPodcastStatus('done')
      }
    } catch {
      setPodcastStatus('error')
    }
  }

  function downloadPodcastScript() {
    if (!podcastScript) return
    const blob = new Blob([podcastScript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'podcast-script.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <StepShell
      title="Preview & Export"
      subtitle="Your newsletter is ready! Preview how it will look on Substack, then export it."
      tip="The 'Copy for Substack' button copies formatted HTML to your clipboard. Open Substack's editor, click in the body, and paste (Ctrl+V / Cmd+V) — all the formatting will be preserved."
    >
      {/* Toggle preview / export */}
      <div className="mb-6 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => setShowPreview(true)}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            showPreview
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setShowPreview(false)}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            !showPreview
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Export Options
        </button>
      </div>

      {showPreview ? (
        /* ── Preview ── */
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-2 text-center">
            <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
              Substack Preview
            </span>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <NewsletterPreview newsletter={newsletter} />
          </div>
        </div>
      ) : (
        /* ── Export Options ── */
        <div className="space-y-4">
          {/* Copy for Substack */}
          <ExportCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            }
            title="Copy for Substack"
            description="Copies your newsletter as formatted HTML. Open Substack's editor and paste — headings, quotes, and lists will all be preserved."
            action={
              <button
                onClick={copyForSubstack}
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            }
          />

          {/* Download Markdown */}
          <ExportCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            }
            title="Download Markdown"
            description="A clean .md file you can use anywhere — other blogging platforms, documentation, or your own archive."
            action={
              <button
                onClick={downloadMarkdown}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Download .md
              </button>
            }
          />

          {/* Generate Podcast */}
          <ExportCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            }
            title="Generate Podcast"
            description="Turns your newsletter into a two-host conversational podcast using NotebookLM. If the API isn't available, we'll generate a ready-to-read podcast script instead."
            action={
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={generatePodcast}
                  disabled={podcastStatus === 'generating'}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {podcastStatus === 'generating'
                    ? 'Generating...'
                    : podcastStatus === 'done'
                      ? 'Regenerate'
                      : podcastStatus === 'error'
                        ? 'Try Again'
                        : 'Generate Podcast'}
                </button>
                {podcastStatus === 'done' && podcastScript && (
                  <button
                    onClick={downloadPodcastScript}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Download podcast script
                  </button>
                )}
              </div>
            }
          />

          {/* Podcast script preview */}
          {podcastScript && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Podcast Script Preview
              </p>
              <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-gray-700">
                {podcastScript}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg px-4 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100"
        >
          Back to Images
        </button>
        <button
          onClick={onStartOver}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          Start Over with New Chat
        </button>
      </div>
    </StepShell>
  )
}

/* ─── Export option card ────────────────────────────── */

function ExportCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          {description}
        </p>
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  )
}
