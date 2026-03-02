# WhatsApp Newsletter Generator - Project Plan

## Overview
A web application that lets users drag-and-drop a WhatsApp chat export, then generates a polished Substack-ready newsletter with AI-generated titles, subtitles, and images. Includes an image gallery system and NotebookLM-powered podcast generation.

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Drag & Drop**: react-dropzone
- **Rich Text / Newsletter Preview**: Custom React components with live preview
- **AI Text Generation**: Anthropic Claude API (claude-sonnet-4-6 for generation)
- **AI Image Generation**: Nano Banana Pro (Google Gemini `gemini-3-pro-image-preview`) — text-to-image, image editing, text rendering in images
- **Image Gallery**: Local gallery store with upload support; AI selects from gallery or generates new images
- **Podcast Generation**: Google NotebookLM Enterprise Podcast API (standalone) — sends newsletter text, returns MP3
- **Podcast Fallback**: Podcastfy (open-source) or DIY Claude + TTS if NotebookLM access is unavailable
- **Export Format**: Substack-optimized HTML (inline styles, compatible with Substack editor paste)
- **State Management**: React context + useReducer

### API Keys Required
| Service | Key | Purpose |
|---------|-----|---------|
| Anthropic | `ANTHROPIC_API_KEY` | Claude for newsletter text generation |
| Google AI | `GEMINI_API_KEY` | Nano Banana Pro for image generation (requires billing-enabled GCP project) |
| Google Cloud | `GOOGLE_CLOUD_PROJECT_ID` + service account | NotebookLM Podcast API (requires allowlist approval) |

### Project Structure
```
newsletterbot/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Landing / upload page
│   │   ├── editor/
│   │   │   └── page.tsx                 # Newsletter editor page
│   │   ├── gallery/
│   │   │   └── page.tsx                 # Image gallery management
│   │   └── api/
│   │       ├── parse/route.ts           # WhatsApp chat parser
│   │       ├── generate/route.ts        # Claude newsletter generation
│   │       ├── image/
│   │       │   ├── generate/route.ts    # Nano Banana Pro image generation
│   │       │   └── gallery/route.ts     # Gallery CRUD (upload, list, delete)
│   │       └── podcast/route.ts         # NotebookLM podcast generation
│   ├── components/
│   │   ├── upload/
│   │   │   ├── DropZone.tsx             # Drag-and-drop file upload
│   │   │   └── ChatPreview.tsx          # Raw chat preview after upload
│   │   ├── editor/
│   │   │   ├── NewsletterEditor.tsx     # Main editor orchestrator
│   │   │   ├── TitleSection.tsx         # Editable title + subtitle
│   │   │   ├── HeroImage.tsx            # Hero image with gallery picker + AI gen
│   │   │   ├── IntroSection.tsx         # Newsletter intro/summary
│   │   │   ├── SectionBlock.tsx         # Repeatable content section
│   │   │   ├── HighlightsBlock.tsx      # Bullet-point highlights
│   │   │   ├── QuoteBlock.tsx           # Pull quotes
│   │   │   ├── EventsBlock.tsx          # Upcoming events section
│   │   │   └── Toolbar.tsx              # Editor action bar
│   │   ├── gallery/
│   │   │   ├── ImageGallery.tsx         # Browse/select from gallery
│   │   │   ├── ImageUploader.tsx        # Upload new images to gallery
│   │   │   └── ImageCard.tsx            # Individual image thumbnail
│   │   ├── preview/
│   │   │   └── NewsletterPreview.tsx    # Live Substack-formatted preview
│   │   └── export/
│   │       ├── ExportPanel.tsx          # Export options UI
│   │       └── PodcastPanel.tsx         # Podcast generation + download
│   ├── lib/
│   │   ├── parser.ts                    # WhatsApp chat parsing logic
│   │   ├── claude.ts                    # Anthropic Claude API helpers
│   │   ├── nanobananapro.ts             # Nano Banana Pro (Gemini) image API
│   │   ├── notebooklm.ts               # NotebookLM Podcast API helpers
│   │   ├── gallery.ts                   # Gallery storage & retrieval
│   │   ├── newsletter-types.ts          # TypeScript types
│   │   └── export.ts                    # Substack HTML + Markdown export
│   └── styles/
│       └── newsletter.css               # Substack-matching styles
├── gallery/                             # Local image gallery storage
├── public/
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
5. Set up environment config for API keys

### Phase 2: AI Newsletter Generation (Claude)
6. Define newsletter data model (TypeScript types)
7. Build API route that sends parsed chat to Claude and returns structured newsletter JSON
8. Claude generates: title, subtitle, intro paragraph, sectioned highlights, quotes, takeaways
9. Build loading/progress UI during generation

### Phase 3: Newsletter Editor UI
10. Build the full newsletter editor with editable sections
11. Each section (title, intro, highlights, quotes, events) is independently editable
12. Add "Regenerate" buttons per section to re-prompt Claude for alternatives
13. Live preview panel showing the Substack-formatted newsletter side-by-side

### Phase 4: Image Gallery + Nano Banana Pro
14. Build image gallery system — upload, browse, tag, select
15. Gallery persists locally (filesystem or browser storage)
16. Build Nano Banana Pro API integration for AI image generation
17. Hero image: user can pick from gallery OR generate new with AI
18. AI can also suggest gallery images based on newsletter theme
19. Inline image slots throughout the newsletter (section headers, etc.)

### Phase 5: Substack Export + NotebookLM Podcast
20. Export as Substack-optimized HTML (inline styles, Substack heading/quote/list conventions)
21. "Copy to Clipboard" for direct paste into Substack editor
22. Export as Markdown
23. NotebookLM Podcast API integration — send newsletter content, get MP3
24. Podcast panel: generate, preview audio player, download MP3
25. Fallback: if NotebookLM unavailable, generate a podcast-ready script via Claude

---

## Newsletter Data Model

```typescript
interface Newsletter {
  title: string;                    // "From Blumhouse to Times Square..."
  subtitle: string;                 // "... still wondering if robots have celluloid dreams"
  publicationName: string;          // "Machine Cinema"
  date: string;
  editedBy: string;
  heroImage?: NewsletterImage;
  intro: string;                    // Opening paragraph
  sections: NewsletterSection[];
  highlights: Highlight[];
  quotes: Quote[];
  takeaways: string[];
  events: Event[];
  podcastUrl?: string;              // Generated MP3 URL
}

interface NewsletterImage {
  url: string;                      // Local/gallery URL or generated data URI
  source: 'gallery' | 'generated'; // Where image came from
  prompt?: string;                  // AI generation prompt (if generated)
  alt: string;                      // Alt text
}

interface NewsletterSection {
  heading: string;
  subheading?: string;
  body: string;                     // Markdown content
  images?: NewsletterImage[];
  bulletPoints?: string[];
}

interface Highlight {
  speaker?: string;
  topic: string;
  points: string[];
}

interface Quote {
  text: string;
  attribution: string;
}

interface Event {
  title: string;
  date: string;
  time: string;
  description: string;
  guests?: { name: string; bio: string }[];
}

interface GalleryImage {
  id: string;
  filename: string;
  url: string;
  tags: string[];
  uploadedAt: string;
  width: number;
  height: number;
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
│   └─────────────────────────────────┘       │
│                                              │
│   [ Chat Preview: 247 messages, 12 users ]  │
│   [ Generate Newsletter → ]                  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│           EDITOR PAGE (split view)                       │
│                                                          │
│  ┌───────────────────┐  ┌─────────────────────────────┐ │
│  │ Edit Panel         │  │ Live Preview (Substack)     │ │
│  │                    │  │                             │ │
│  │ [Title]         ↻  │  │ ┌─────────────────────────┐│ │
│  │ [Subtitle]      ↻  │  │ │ Hero Image              ││ │
│  │                    │  │ ├─────────────────────────┤│ │
│  │ [Hero Image]       │  │ │ Title                   ││ │
│  │  • Pick from 🖼️    │  │ │ Subtitle                ││ │
│  │  • Generate w/ AI  │  │ │ Publication · Date      ││ │
│  │  • Edit prompt  ↻  │  │ │                         ││ │
│  │                    │  │ │ Intro...                ││ │
│  │ [Intro]         ↻  │  │ │                         ││ │
│  │ [Sections]      ↻  │  │ │ Section 1               ││ │
│  │ [Highlights]    ↻  │  │ │  • highlights            ││ │
│  │ [Quotes]        ↻  │  │ │  "quote..."              ││ │
│  │ [Takeaways]     ↻  │  │ │                         ││ │
│  │ [Events]        ↻  │  │ │ Takeaways               ││ │
│  │                    │  │ │ Coming Up...             ││ │
│  │ ────────────────  │  │ └─────────────────────────┘│ │
│  │ [Export ▼]         │  │                             │ │
│  │  • Copy for        │  │                             │ │
│  │    Substack        │  │                             │ │
│  │  • Markdown        │  │                             │ │
│  │  • 🎙️ Generate     │  │                             │ │
│  │    Podcast (NBLM)  │  │                             │ │
│  └───────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           IMAGE GALLERY                      │
│                                              │
│  [Upload Images +]    [Search/Filter]        │
│                                              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ img │ │ img │ │ img │ │ img │          │
│  │  1  │ │  2  │ │  3  │ │  4  │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ img │ │ img │ │ img │ │ img │          │
│  │  5  │ │  6  │ │  7  │ │  8  │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│                                              │
│  Tags: [events] [speakers] [promo] [hero]   │
└─────────────────────────────────────────────┘
```

---

## Key Design Decisions

1. **Claude for Text Generation**: All newsletter text (title, subtitle, intro, sections, highlights, quotes, takeaways) is generated by Claude via the Anthropic API. Structured JSON output ensures predictable, editable content.

2. **Nano Banana Pro for Images**: Google's Gemini-based image model (`gemini-3-pro-image-preview`) handles hero images, section illustrations, and text-rendered graphics. Supports conversational editing (generate → refine → adjust). **Note**: Gemini 3 Pro Preview is deprecated March 9, 2026 — we'll use `gemini-3.1-flash-image-preview` as fallback/upgrade path.

3. **Image Gallery**: A persistent gallery where users upload their own images (speaker photos, logos, event graphics). When placing images in the newsletter, users can pick from gallery or generate fresh. AI can also recommend gallery matches based on content.

4. **Substack-Optimized Export**: The HTML export uses Substack-compatible conventions — inline styles, their heading hierarchy, blockquote formatting for pull quotes, and image sizing that works with their editor. "Copy to Clipboard" pastes cleanly into the Substack compose window.

5. **NotebookLM Podcast**: The standalone Podcast API (`POST /v1/projects/{id}/locations/global/podcasts`) accepts newsletter text in the `contexts` array and returns an MP3 of a two-host podcast discussion. Generation is async (poll for completion, then download). **Access requires Google Cloud allowlist** — we'll implement a fallback that generates a podcast script via Claude for manual TTS if API access isn't available.

6. **WhatsApp Parser**: Handles the standard WhatsApp export format (`[MM/DD/YY, HH:MM:SS] Name: Message`). Extracts participants, timestamps, media references, links.

---

## Phase 1 Deliverable (What we build first)
- Next.js project scaffolding
- Landing page with drag-and-drop
- WhatsApp chat parser
- Basic chat preview
- Navigation to editor page
- Newsletter data types
- Environment config (.env.local template)
