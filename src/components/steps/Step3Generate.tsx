'use client'

import { useEffect, useState } from 'react'
import StepShell from '../stepper/StepShell'

interface Step3GenerateProps {
  onComplete: () => void
  error?: string | null
}

const PROGRESS_STEPS = [
  { label: 'Reading conversation...', detail: 'Scanning all messages for key topics and themes' },
  { label: 'Identifying speakers...', detail: 'Figuring out who said what and their perspectives' },
  { label: 'Extracting highlights...', detail: 'Pulling out the most impactful moments and quotes' },
  { label: 'Structuring sections...', detail: 'Organizing the content into a logical newsletter flow' },
  { label: 'Writing newsletter...', detail: 'Crafting the title, intro, and section copy' },
  { label: 'Polishing...', detail: 'Final editorial pass for tone and clarity' },
]

export default function Step3Generate({ onComplete, error }: Step3GenerateProps) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (error) return

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= PROGRESS_STEPS.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [error])

  if (error) {
    return (
      <StepShell
        title="Generation Failed"
        subtitle="Something went wrong while generating your newsletter."
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="mb-2 text-sm font-semibold text-red-800">Error</p>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <button
            onClick={onComplete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </StepShell>
    )
  }

  return (
    <StepShell
      title="Generating Your Newsletter"
      subtitle="Claude is reading through your conversation and transforming it into a structured, polished newsletter. This usually takes 15-30 seconds."
    >
      {/* What's happening explanation */}
      <div className="mb-8 rounded-lg border border-gray-100 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          What&apos;s happening right now
        </h3>

        <div className="space-y-4">
          {PROGRESS_STEPS.map((step, i) => {
            const isActive = i === activeStep
            const isCompleted = i < activeStep

            return (
              <div key={i} className="flex items-start gap-3">
                {/* Status icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  ) : isActive ? (
                    <div className="flex h-5 w-5 items-center justify-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-gray-200" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div>
                  <p
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? 'text-brand-700'
                        : isCompleted
                          ? 'text-green-700'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {(isActive || isCompleted) && (
                    <p className="mt-0.5 text-xs text-gray-500">{step.detail}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Behind the scenes */}
      <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-xs leading-relaxed text-amber-800">
          <span className="font-semibold">Behind the scenes:</span> Claude reads
          every message in your chat, identifies the main topics and speakers,
          pulls out the most quotable moments, and writes each section of the
          newsletter in a professional editorial style — the same kind of writing
          you see in Substack publications like Machine Cinema or Stratechery.
        </p>
      </div>
    </StepShell>
  )
}
