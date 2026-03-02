'use client'

import type { ParsedChat } from '@/lib/newsletter-types'
import StepShell from '../stepper/StepShell'

interface Step2ReviewProps {
  parsed: ParsedChat
  onContinue: () => void
  onBack: () => void
}

export default function Step2Review({
  parsed,
  onContinue,
  onBack,
}: Step2ReviewProps) {
  // Group messages by sender for a quick participant breakdown
  const messageCounts: Record<string, number> = {}
  for (const msg of parsed.messages) {
    messageCounts[msg.sender] = (messageCounts[msg.sender] || 0) + 1
  }
  const sortedParticipants = Object.entries(messageCounts).sort(
    (a, b) => b[1] - a[1]
  )

  return (
    <StepShell
      title="Review Your Chat"
      subtitle="Here's what we found in your conversation. Make sure this looks right before we generate the newsletter."
      tip="The AI works best with chats that have real discussion — back-and-forth between participants, shared ideas, or event recaps. Short chats with just links or emojis won't produce great results."
    >
      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Messages', value: parsed.messageCount },
          { label: 'Participants', value: parsed.participants.length },
          { label: 'Media Files', value: parsed.mediaCount },
          {
            label: 'Date Range',
            value: parsed.dateRange.start
              ? `${parsed.dateRange.start.split(',')[0]} — ${parsed.dateRange.end.split(',')[0]}`
              : 'N/A',
            isSmall: true,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-100 bg-white p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {stat.label}
            </p>
            <p
              className={`mt-1 font-bold text-gray-900 ${
                'isSmall' in stat && stat.isSmall ? 'text-sm' : 'text-2xl'
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Participants breakdown */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Who&apos;s in this chat
        </h3>
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {sortedParticipants.map(([name, count]) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-full bg-gray-50 py-1.5 pl-3 pr-4"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {count} msg{count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message preview */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Conversation preview
        </h3>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-100 bg-white">
          {parsed.messages.slice(0, 40).map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 px-4 py-2.5 ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                {msg.sender.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-gray-700">
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                  {msg.isMedia ? (
                    <span className="italic text-gray-400">[media file]</span>
                  ) : msg.content.length > 200 ? (
                    msg.content.slice(0, 200) + '...'
                  ) : (
                    msg.content
                  )}
                </p>
              </div>
            </div>
          ))}
          {parsed.messages.length > 40 && (
            <div className="border-t border-gray-100 py-3 text-center text-xs text-gray-400">
              + {parsed.messages.length - 40} more messages
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg px-4 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100"
        >
          Upload Different File
        </button>
        <button
          onClick={onContinue}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Looks Good — Generate Newsletter
        </button>
      </div>
    </StepShell>
  )
}
