# WhatsApp Newsletter Generator - Project Plan

## Overview
A web application that lets users drag-and-drop a WhatsApp chat export, then generates a polished newsletter (similar to Machine Cinema's Substack format) with AI-generated titles, subtitles, images, and podcast-ready output.

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Drag & Drop**: react-dropzone
- **Rich Text / Newsletter Preview**: Custom React components with live preview
- **AI Integration**: OpenAI API (GPT-4 for text, DALL-E 3 for images)
- **Podcast Output**: Structured markdown/JSON export ready for TTS
- **State Management**: React context + useReducer (lightweight, no Redux needed)

### Project Structure
```
newsletterbot/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing / upload page
│   │   ├── editor/
│   │   │   └── page.tsx        # Newsletter editor page
│   │   └── api/
│   │       ├── parse/route.ts       # WhatsApp chat parser endpoint
│   │       ├── generate/route.ts    # AI newsletter generation endpoint
│   │       └── image/route.ts       # AI image generation endpoint
│   ├── components/
│   │   ├── upload/
│   │   │   ├── DropZone.tsx         # Drag-and-drop file upload
│   │   │   └── ChatPreview.tsx      # Raw chat preview after upload
│   │   ├── editor/
│   │   │   ├── NewsletterEditor.tsx  # Main editor orchestrator
│   │   │   ├── TitleSection.tsx      # Editable title + subtitle
│   │   │   ├── HeroImage.tsx         # AI-generated hero image with regen
│   │   │   ├── IntroSection.tsx      # Newsletter intro/summary
│   │   │   ├── SectionBlock.tsx      # Repeatable content section
│   │   │   ├── HighlightsBlock.tsx   # Bullet-point highlights
│   │   │   ├── QuoteBlock.tsx        # Pull quotes
│   │   │   ├── EventsBlock.tsx       # Upcoming events section
│   │   │   └── Toolbar.tsx           # Editor action bar
│   │   ├── preview/
│   │   │   └── NewsletterPreview.tsx # Live formatted preview
│   │   └── export/
│   │       ├── ExportPanel.tsx       # Export options UI
│   │       └── PodcastScript.tsx     # Podcast script preview
│   ├── lib/
│   │   ├── parser.ts                # WhatsApp chat parsing logic
│   │   ├── ai.ts                    # OpenAI API helpers
│   │   ├── newsletter-types.ts      # TypeScript types for newsletter data
│   │   └── export.ts                # Export utilities (HTML, Markdown, Podcast)
│   └── styles/
│       └── newsletter.css           # Newsletter-specific styles
├── public/
│   └── ...
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Phases & Steps

### Phase 1: Project Setup & Upload UX
1. Initialize Next.js project with TypeScript + Tailwind
2. Build the landing page with drag-and-drop zone
3. Implement WhatsApp chat file parser (handles `.txt` exports)
4. Show parsed chat preview with message count, participants, date range

### Phase 2: AI Newsletter Generation
5. Define newsletter data model (TypeScript types)
6. Build API route that sends parsed chat to GPT-4 and returns structured newsletter
7. AI generates: title, subtitle, intro paragraph, sectioned highlights, quotes, takeaways
8. Build loading/progress UI during generation

### Phase 3: Newsletter Editor UI
9. Build the full newsletter editor with editable sections
10. Each section (title, intro, highlights, quotes, events) is independently editable
11. Add "Regenerate" buttons per section to re-prompt AI for alternatives
12. Live preview panel showing the formatted newsletter side-by-side

### Phase 4: AI Image Generation
13. Build image generation API route (DALL-E 3 or placeholder)
14. Auto-generate a hero/header image based on newsletter theme
15. Allow users to describe/adjust the image prompt and regenerate
16. Support multiple image slots (hero, section breaks)

### Phase 5: Export & Podcast Output
17. Export as formatted HTML (copy-paste into Substack/email)
18. Export as Markdown
19. Generate a "podcast script" version — conversational rewrite of the newsletter
20. Export podcast script as plain text (ready for TTS tools like ElevenLabs)

---

## Newsletter Data Model

```typescript
interface Newsletter {
  title: string;                    // "From Blumhouse to Times Square..."
  subtitle: string;                 // "... still wondering if robots have celluloid dreams"
  publicationName: string;          // "Machine Cinema"
  date: string;
  editedBy: string;
  heroImage?: { url: string; prompt: string };
  intro: string;                    // Opening paragraph
  sections: NewsletterSection[];
  highlights: Highlight[];
  quotes: Quote[];
  takeaways: string[];
  events: Event[];
  podcastScript?: string;
}
```

---

## UI Flow

```
┌─────────────────────────────────────────────┐
│           LANDING PAGE                       │
│                                              │
│   ┌─────────────────────────────────┐       │
│   │                                 │       │
│   │     Drag & Drop WhatsApp        │       │
│   │     Chat Export Here            │       │
│   │                                 │       │
│   │     (.txt file)                 │       │
│   │                                 │       │
│   └─────────────────────────────────┘       │
│                                              │
│   [ Chat Preview: 247 messages, 12 users ]  │
│   [ Generate Newsletter → ]                  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           EDITOR PAGE (split view)           │
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Edit Panel    │  │ Live Preview         │ │
│  │               │  │                      │ │
│  │ [Title]    ↻  │  │ ┌──────────────────┐│ │
│  │ [Subtitle] ↻  │  │ │ Hero Image       ││ │
│  │ [Hero Img] ↻  │  │ ├──────────────────┤│ │
│  │ [Intro]    ↻  │  │ │ Title            ││ │
│  │ [Sections] ↻  │  │ │ Subtitle         ││ │
│  │ [Quotes]   ↻  │  │ │ Intro...         ││ │
│  │ [Takeaways]↻  │  │ │ Sections...      ││ │
│  │ [Events]   ↻  │  │ │ Quotes...        ││ │
│  │               │  │ │ Takeaways...     ││ │
│  │ ──────────── │  │ │ Events...        ││ │
│  │ [Export ▼]    │  │ └──────────────────┘│ │
│  │  • HTML       │  │                      │ │
│  │  • Markdown   │  │                      │ │
│  │  • Podcast    │  │                      │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Key Design Decisions

1. **WhatsApp Parser**: Handles the standard WhatsApp export format (`[MM/DD/YY, HH:MM:SS] Name: Message`). Extracts participants, timestamps, media references, links.

2. **AI Prompt Strategy**: The parsed chat is summarized and sent to GPT-4 with a structured prompt that outputs JSON matching our `Newsletter` type. This ensures we get back editable, sectioned content.

3. **Image Generation**: We generate a thematic header image based on the newsletter title + key topics. Users can edit the prompt and regenerate.

4. **Podcast Script**: A separate AI call reformats the newsletter into a conversational script with host/guest dialogue markers, transitions, and natural speech patterns.

5. **Export**: HTML export uses inline styles for email compatibility. Markdown export is clean and portable. Podcast export is plain text with speaker labels.

---

## Phase 1 Deliverable (What we build first)
- Next.js project scaffolding
- Landing page with drag-and-drop
- WhatsApp chat parser
- Basic chat preview
- Navigation to editor page
- Newsletter data types
