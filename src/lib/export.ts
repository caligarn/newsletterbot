import type { Newsletter } from './newsletter-types'

/**
 * Generates Substack-optimized HTML from a Newsletter object.
 * Uses inline styles compatible with Substack's editor when pasted.
 */
export function toSubstackHTML(newsletter: Newsletter): string {
  const lines: string[] = []

  // Title
  lines.push(
    `<h1 style="font-size:2em;font-weight:bold;line-height:1.2;margin-bottom:0.25em;">${esc(newsletter.title)}</h1>`
  )

  // Subtitle
  if (newsletter.subtitle) {
    lines.push(
      `<p style="font-size:1.1em;color:#666;font-style:italic;margin-bottom:1em;">${esc(newsletter.subtitle)}</p>`
    )
  }

  // Publication + date + editor
  lines.push(
    `<p style="font-size:0.9em;color:#999;margin-bottom:0.5em;">${esc(newsletter.publicationName)}</p>`
  )
  lines.push(
    `<p style="font-size:0.85em;color:#999;margin-bottom:2em;">${esc(newsletter.date)}${newsletter.editedBy ? ` · Edited by ${esc(newsletter.editedBy)}` : ''}</p>`
  )

  // Hero image
  if (newsletter.heroImage) {
    lines.push(
      `<img src="${esc(newsletter.heroImage.url)}" alt="${esc(newsletter.heroImage.alt)}" style="width:100%;max-width:680px;border-radius:4px;margin-bottom:2em;" />`
    )
  }

  // Intro
  lines.push(`<p style="font-size:1.05em;line-height:1.7;margin-bottom:2em;">${esc(newsletter.intro)}</p>`)

  // Sections
  for (const section of newsletter.sections) {
    lines.push(
      `<h2 style="font-size:1.4em;font-weight:bold;margin-top:2em;margin-bottom:0.5em;">${esc(section.heading)}</h2>`
    )
    if (section.subheading) {
      lines.push(
        `<h3 style="font-size:1.1em;color:#555;font-weight:normal;margin-bottom:1em;">${esc(section.subheading)}</h3>`
      )
    }

    // Body — convert markdown-ish content to paragraphs
    const bodyParagraphs = section.body.split('\n\n').filter(Boolean)
    for (const p of bodyParagraphs) {
      lines.push(
        `<p style="line-height:1.7;margin-bottom:1em;">${markdownToInlineHTML(p)}</p>`
      )
    }

    // Bullet points
    if (section.bulletPoints && section.bulletPoints.length > 0) {
      lines.push('<ul style="margin-bottom:1.5em;padding-left:1.5em;">')
      for (const point of section.bulletPoints) {
        lines.push(
          `<li style="margin-bottom:0.5em;line-height:1.6;">${markdownToInlineHTML(point)}</li>`
        )
      }
      lines.push('</ul>')
    }
  }

  // Quotes
  if (newsletter.quotes.length > 0) {
    for (const quote of newsletter.quotes) {
      lines.push(
        `<blockquote style="border-left:3px solid #ccc;padding-left:1em;margin:1.5em 0;font-style:italic;color:#444;">
  <p style="margin-bottom:0.5em;">"${esc(quote.text)}"</p>
  <p style="font-size:0.9em;color:#777;">— ${esc(quote.attribution)}</p>
</blockquote>`
      )
    }
  }

  // Takeaways
  if (newsletter.takeaways.length > 0) {
    lines.push(
      `<h2 style="font-size:1.4em;font-weight:bold;margin-top:2em;margin-bottom:0.75em;">Takeaways</h2>`
    )
    lines.push('<ul style="margin-bottom:1.5em;padding-left:1.5em;">')
    for (const t of newsletter.takeaways) {
      lines.push(
        `<li style="margin-bottom:0.5em;line-height:1.6;">${markdownToInlineHTML(t)}</li>`
      )
    }
    lines.push('</ul>')
  }

  // Events
  if (newsletter.events.length > 0) {
    lines.push(
      `<h2 style="font-size:1.4em;font-weight:bold;margin-top:2em;margin-bottom:0.75em;">Coming Up</h2>`
    )
    for (const event of newsletter.events) {
      lines.push(
        `<h3 style="font-size:1.1em;font-weight:bold;margin-bottom:0.25em;">${esc(event.title)}</h3>`
      )
      lines.push(
        `<p style="font-size:0.9em;color:#666;margin-bottom:0.5em;">${esc(event.date)} @ ${esc(event.time)}</p>`
      )
      lines.push(
        `<p style="line-height:1.6;margin-bottom:1em;">${esc(event.description)}</p>`
      )
      if (event.guests && event.guests.length > 0) {
        for (const guest of event.guests) {
          lines.push(
            `<p style="margin-bottom:0.5em;"><strong>${esc(guest.name)}</strong> — ${esc(guest.bio)}</p>`
          )
        }
      }
    }
  }

  return lines.join('\n')
}

/**
 * Generates clean Markdown from a Newsletter object.
 */
export function toMarkdown(newsletter: Newsletter): string {
  const lines: string[] = []

  lines.push(`# ${newsletter.title}`)
  if (newsletter.subtitle) lines.push(`*${newsletter.subtitle}*`)
  lines.push('')
  lines.push(`${newsletter.publicationName}`)
  lines.push(
    `${newsletter.date}${newsletter.editedBy ? ` · Edited by ${newsletter.editedBy}` : ''}`
  )
  lines.push('')

  lines.push(newsletter.intro)
  lines.push('')

  for (const section of newsletter.sections) {
    lines.push(`## ${section.heading}`)
    if (section.subheading) lines.push(`### ${section.subheading}`)
    lines.push('')
    lines.push(section.body)
    lines.push('')

    if (section.bulletPoints && section.bulletPoints.length > 0) {
      for (const point of section.bulletPoints) {
        lines.push(`* ${point}`)
      }
      lines.push('')
    }
  }

  if (newsletter.quotes.length > 0) {
    for (const quote of newsletter.quotes) {
      lines.push(`> "${quote.text}" — ${quote.attribution}`)
      lines.push('')
    }
  }

  if (newsletter.takeaways.length > 0) {
    lines.push('## Takeaways')
    for (const t of newsletter.takeaways) {
      lines.push(`* ${t}`)
    }
    lines.push('')
  }

  if (newsletter.events.length > 0) {
    lines.push('## Coming Up')
    lines.push('')
    for (const event of newsletter.events) {
      lines.push(`### ${event.title}`)
      lines.push(`${event.date} @ ${event.time}`)
      lines.push('')
      lines.push(event.description)
      if (event.guests) {
        for (const guest of event.guests) {
          lines.push(`**${guest.name}** — ${guest.bio}`)
        }
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function markdownToInlineHTML(text: string): string {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}
