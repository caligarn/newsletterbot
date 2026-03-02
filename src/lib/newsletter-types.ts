export interface Newsletter {
  title: string
  subtitle: string
  publicationName: string
  date: string
  editedBy: string
  heroImage?: NewsletterImage
  intro: string
  sections: NewsletterSection[]
  highlights: Highlight[]
  quotes: Quote[]
  takeaways: string[]
  events: Event[]
  podcastUrl?: string
}

export interface NewsletterImage {
  url: string
  source: 'gallery' | 'generated'
  prompt?: string
  alt: string
}

export interface NewsletterSection {
  heading: string
  subheading?: string
  body: string
  images?: NewsletterImage[]
  bulletPoints?: string[]
}

export interface Highlight {
  speaker?: string
  topic: string
  points: string[]
}

export interface Quote {
  text: string
  attribution: string
}

export interface Event {
  title: string
  date: string
  time: string
  description: string
  guests?: EventGuest[]
}

export interface EventGuest {
  name: string
  bio: string
}

export interface GalleryImage {
  id: string
  filename: string
  url: string
  tags: string[]
  uploadedAt: string
  width: number
  height: number
}

export interface ParsedChat {
  messages: ChatMessage[]
  participants: string[]
  dateRange: { start: string; end: string }
  messageCount: number
  mediaCount: number
}

export interface ChatMessage {
  timestamp: string
  sender: string
  content: string
  isMedia: boolean
}
