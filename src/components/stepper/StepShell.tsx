'use client'

interface StepShellProps {
  title: string
  subtitle: string
  tip?: string
  children: React.ReactNode
}

export default function StepShell({
  title,
  subtitle,
  tip,
  children,
}: StepShellProps) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">{subtitle}</p>
      </div>

      {/* Tip box */}
      {tip && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <span className="mt-0.5 flex-shrink-0 text-blue-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </span>
          <p className="text-xs leading-relaxed text-blue-700">{tip}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  )
}
