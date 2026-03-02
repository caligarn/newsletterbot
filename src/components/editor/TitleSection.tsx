'use client'

interface TitleSectionProps {
  title: string
  subtitle: string
  onTitleChange: (value: string) => void
  onSubtitleChange: (value: string) => void
  onRegenerateTitle: () => void
  onRegenerateSubtitle: () => void
  isRegenerating: boolean
}

export default function TitleSection({
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
  onRegenerateTitle,
  onRegenerateSubtitle,
  isRegenerating,
}: TitleSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Title
        </h3>
        <button
          onClick={onRegenerateTitle}
          disabled={isRegenerating}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 disabled:opacity-50"
        >
          <span className={isRegenerating ? 'animate-spin' : ''}>&#8635;</span>
          Regenerate
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="mb-3 w-full border-b border-gray-200 bg-transparent pb-2 text-xl font-bold text-gray-900 focus:border-brand-400 focus:outline-none"
        placeholder="Newsletter title..."
      />

      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-400">Subtitle</label>
        <button
          onClick={onRegenerateSubtitle}
          disabled={isRegenerating}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 disabled:opacity-50"
        >
          <span className={isRegenerating ? 'animate-spin' : ''}>&#8635;</span>
          Regenerate
        </button>
      </div>
      <input
        type="text"
        value={subtitle}
        onChange={(e) => onSubtitleChange(e.target.value)}
        className="w-full border-b border-gray-200 bg-transparent pb-2 text-sm italic text-gray-600 focus:border-brand-400 focus:outline-none"
        placeholder="Subtitle..."
      />
    </div>
  )
}
