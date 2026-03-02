'use client'

import type { Newsletter } from '@/lib/newsletter-types'

interface NewsletterPreviewProps {
  newsletter: Newsletter
}

export default function NewsletterPreview({
  newsletter,
}: NewsletterPreviewProps) {
  return (
    <div className="mx-auto max-w-[680px] bg-white px-8 py-10 font-serif">
      {/* Hero image */}
      {newsletter.heroImage && (
        <div className="mb-8">
          <img
            src={newsletter.heroImage.url}
            alt={newsletter.heroImage.alt}
            className="w-full rounded"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="mb-2 text-3xl font-bold leading-tight text-gray-900">
        {newsletter.title}
      </h1>

      {/* Subtitle */}
      {newsletter.subtitle && (
        <p className="mb-4 text-lg italic text-gray-500">
          {newsletter.subtitle}
        </p>
      )}

      {/* Publication meta */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <p className="text-sm font-medium text-gray-700">
          {newsletter.publicationName}
        </p>
        <p className="text-sm text-gray-500">
          {newsletter.date}
          {newsletter.editedBy && ` · Edited by ${newsletter.editedBy}`}
        </p>
      </div>

      {/* Intro */}
      <p className="mb-8 text-base leading-relaxed text-gray-800">
        {newsletter.intro}
      </p>

      {/* Sections */}
      {newsletter.sections.map((section, i) => (
        <div key={i} className="mb-8">
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            {section.heading}
          </h2>
          {section.subheading && (
            <h3 className="mb-3 text-base text-gray-600">
              {section.subheading}
            </h3>
          )}

          {/* Body — render paragraphs */}
          {section.body.split('\n\n').map((para, j) => (
            <p key={j} className="mb-3 text-base leading-relaxed text-gray-800">
              {para}
            </p>
          ))}

          {/* Bullet points */}
          {section.bulletPoints && section.bulletPoints.length > 0 && (
            <ul className="mb-4 list-disc pl-6">
              {section.bulletPoints.map((point, k) => (
                <li
                  key={k}
                  className="mb-1 text-base leading-relaxed text-gray-800"
                >
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* Highlights */}
      {newsletter.highlights.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Highlights</h2>
          {newsletter.highlights.map((h, i) => (
            <div key={i} className="mb-4">
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {h.topic}
                {h.speaker && ` — ${h.speaker}`}
              </p>
              <ul className="list-disc pl-6">
                {h.points.map((point, j) => (
                  <li
                    key={j}
                    className="mb-1 text-base leading-relaxed text-gray-800"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Quotes */}
      {newsletter.quotes.length > 0 && (
        <div className="mb-8">
          {newsletter.quotes.map((q, i) => (
            <blockquote
              key={i}
              className="my-4 border-l-4 border-gray-300 py-1 pl-4 italic"
            >
              <p className="mb-1 text-base text-gray-700">
                &ldquo;{q.text}&rdquo;
              </p>
              <p className="text-sm text-gray-500">— {q.attribution}</p>
            </blockquote>
          ))}
        </div>
      )}

      {/* Takeaways */}
      {newsletter.takeaways.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900">Takeaways</h2>
          <ul className="list-disc pl-6">
            {newsletter.takeaways.map((t, i) => (
              <li
                key={i}
                className="mb-2 text-base leading-relaxed text-gray-800"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Events */}
      {newsletter.events.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Coming Up</h2>
          {newsletter.events.map((event, i) => (
            <div key={i} className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-1 text-base font-bold text-gray-900">
                {event.title}
              </h3>
              <p className="mb-2 text-sm text-gray-500">
                {event.date} @ {event.time}
              </p>
              <p className="mb-2 text-sm leading-relaxed text-gray-700">
                {event.description}
              </p>
              {event.guests && event.guests.length > 0 && (
                <div className="mt-2">
                  {event.guests.map((guest, j) => (
                    <p key={j} className="text-sm text-gray-600">
                      <span className="font-semibold">{guest.name}</span> —{' '}
                      {guest.bio}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
