'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NewsletterEditor from '@/components/editor/NewsletterEditor'
import NewsletterPreview from '@/components/preview/NewsletterPreview'
import type { Newsletter } from '@/lib/newsletter-types'

export default function EditorPage() {
  const router = useRouter()
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('newsletter')
    if (stored) {
      try {
        setNewsletter(JSON.parse(stored))
      } catch {
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [router])

  // Persist changes to sessionStorage
  useEffect(() => {
    if (newsletter) {
      sessionStorage.setItem('newsletter', JSON.stringify(newsletter))
    }
  }, [newsletter])

  if (!newsletter) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <span className="text-sm text-gray-500">Loading editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left: Editor Panel */}
      <div className="w-[420px] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>
          <span className="text-xs text-gray-400">Editor</span>
        </div>
        <NewsletterEditor newsletter={newsletter} onChange={setNewsletter} />
      </div>

      {/* Right: Live Preview */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto py-8">
          <div className="mb-4 text-center">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
              Substack Preview
            </span>
          </div>
          <div className="mx-auto max-w-[680px] rounded-lg border border-gray-100 shadow-sm">
            <NewsletterPreview newsletter={newsletter} />
          </div>
        </div>
      </div>
    </div>
  )
}
