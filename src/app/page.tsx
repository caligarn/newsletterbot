'use client'

import { useState } from 'react'
import StepIndicator from '@/components/stepper/StepIndicator'
import Step1Upload from '@/components/steps/Step1Upload'
import Step2Review from '@/components/steps/Step2Review'
import Step3Generate from '@/components/steps/Step3Generate'
import Step4Edit from '@/components/steps/Step4Edit'
import Step5Images from '@/components/steps/Step5Images'
import Step6Export from '@/components/steps/Step6Export'
import { parseWhatsAppChat } from '@/lib/parser'
import type { ParsedChat, Newsletter } from '@/lib/newsletter-types'

const STEPS = [
  {
    label: 'Upload Chat',
    description: 'Drop your WhatsApp .txt export here',
  },
  {
    label: 'Review',
    description: 'Check the parsed conversation looks right',
  },
  {
    label: 'Generate',
    description: 'AI creates a structured newsletter from the chat',
  },
  {
    label: 'Edit',
    description: 'Refine the title, sections, quotes, and takeaways',
  },
  {
    label: 'Images',
    description: 'Add a hero image from your gallery or generate with AI',
  },
  {
    label: 'Export',
    description: 'Copy for Substack, download Markdown, or generate a podcast',
  },
]

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [parsedChat, setParsedChat] = useState<ParsedChat | null>(null)
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function handleFileAccepted(text: string) {
    setUploadError(null)
    try {
      const parsed = parseWhatsAppChat(text)
      if (parsed.messages.length === 0) {
        setUploadError(
          'No messages found in this file. Make sure it\'s a WhatsApp chat export — the file should have lines like "[1/1/25, 12:00:00] Name: message".'
        )
        return
      }
      setParsedChat(parsed)
      sessionStorage.setItem('parsedChat', JSON.stringify(parsed))
      setCurrentStep(2)
    } catch {
      setUploadError(
        'Failed to parse the file. Please make sure this is a WhatsApp chat export (.txt).'
      )
    }
  }

  async function handleGenerate() {
    if (!parsedChat) return
    setCurrentStep(3)
    setGenerateError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: parsedChat }),
      })

      if (!response.ok) {
        throw new Error('Newsletter generation failed. Check your API key.')
      }

      const data: Newsletter = await response.json()
      setNewsletter(data)
      sessionStorage.setItem('newsletter', JSON.stringify(data))
      setCurrentStep(4)
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : 'Something went wrong'
      )
    }
  }

  function handleStartOver() {
    setParsedChat(null)
    setNewsletter(null)
    setGenerateError(null)
    setUploadError(null)
    setCurrentStep(1)
    sessionStorage.removeItem('parsedChat')
    sessionStorage.removeItem('newsletter')
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl">
      {/* Left sidebar — step indicator */}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white px-6 py-8 lg:block">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Steps
        </p>
        <StepIndicator currentStep={currentStep} steps={STEPS} />
      </aside>

      {/* Mobile step indicator */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-xs text-gray-400">
            {STEPS[currentStep - 1].label}
          </span>
        </div>
        <div className="mt-2 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= currentStep ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 px-6 py-8 pb-24 lg:px-12 lg:pb-8">
        {currentStep === 1 && (
          <Step1Upload onFileAccepted={handleFileAccepted} error={uploadError} />
        )}

        {currentStep === 2 && parsedChat && (
          <Step2Review
            parsed={parsedChat}
            onContinue={handleGenerate}
            onBack={handleStartOver}
          />
        )}

        {currentStep === 3 && (
          <Step3Generate
            error={generateError}
            onComplete={() => {
              if (generateError) {
                setCurrentStep(2)
                setGenerateError(null)
              }
            }}
          />
        )}

        {currentStep === 4 && newsletter && (
          <Step4Edit
            newsletter={newsletter}
            onChange={(updated) => {
              setNewsletter(updated)
              sessionStorage.setItem('newsletter', JSON.stringify(updated))
            }}
            onContinue={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 5 && newsletter && (
          <Step5Images
            newsletter={newsletter}
            onChange={(updated) => {
              setNewsletter(updated)
              sessionStorage.setItem('newsletter', JSON.stringify(updated))
            }}
            onContinue={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 6 && newsletter && (
          <Step6Export
            newsletter={newsletter}
            onBack={() => setCurrentStep(5)}
            onStartOver={handleStartOver}
          />
        )}
      </main>
    </div>
  )
}
