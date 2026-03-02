'use client'

interface IntroSectionProps {
  intro: string
  onChange: (value: string) => void
  onRegenerate: () => void
  isRegenerating: boolean
}

export default function IntroSection({
  intro,
  onChange,
  onRegenerate,
  isRegenerating,
}: IntroSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Introduction
        </h3>
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 disabled:opacity-50"
        >
          <span className={isRegenerating ? 'animate-spin' : ''}>&#8635;</span>
          Regenerate
        </button>
      </div>
      <textarea
        value={intro}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full resize-y rounded border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-800 focus:border-brand-400 focus:bg-white focus:outline-none"
        placeholder="Newsletter introduction..."
      />
    </div>
  )
}
