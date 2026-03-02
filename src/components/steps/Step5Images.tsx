'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { Newsletter, NewsletterImage } from '@/lib/newsletter-types'
import StepShell from '../stepper/StepShell'

interface Step5ImagesProps {
  newsletter: Newsletter
  onChange: (newsletter: Newsletter) => void
  onContinue: () => void
  onBack: () => void
}

interface LocalImage {
  id: string
  url: string
  filename: string
}

export default function Step5Images({
  newsletter,
  onChange,
  onContinue,
  onBack,
}: Step5ImagesProps) {
  const [galleryImages, setGalleryImages] = useState<LocalImage[]>([])
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeSlot, setActiveSlot] = useState<'hero' | null>('hero')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const reader = new FileReader()
      reader.onload = () => {
        setGalleryImages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            url: reader.result as string,
            filename: file.name,
          },
        ])
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
  })

  function selectImageForSlot(image: LocalImage) {
    if (activeSlot === 'hero') {
      const heroImage: NewsletterImage = {
        url: image.url,
        source: 'gallery',
        alt: image.filename,
      }
      onChange({ ...newsletter, heroImage })
    }
  }

  async function generateImage() {
    if (!aiPrompt.trim()) return
    setIsGenerating(true)
    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: newsletter.title,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.url && activeSlot === 'hero') {
          const heroImage: NewsletterImage = {
            url: data.url,
            source: 'generated',
            prompt: aiPrompt,
            alt: aiPrompt,
          }
          onChange({ ...newsletter, heroImage })
        }
      }
    } catch (error) {
      console.error('Image generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  function removeHeroImage() {
    const updated = { ...newsletter }
    delete updated.heroImage
    onChange(updated)
  }

  return (
    <StepShell
      title="Add Images"
      subtitle="A great newsletter needs visuals. Upload your own images or generate one with AI for the header."
      tip="Hero images set the tone for your newsletter. Use something that captures the theme of the conversation — a speaker photo, event graphic, or an AI-generated illustration."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Image selection */}
        <div className="space-y-4">
          {/* Hero image slot */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Hero Image
            </p>
            <div
              className={`relative aspect-video overflow-hidden rounded-lg border-2 transition ${
                activeSlot === 'hero'
                  ? 'border-brand-400 ring-2 ring-brand-50'
                  : 'border-gray-200'
              } ${newsletter.heroImage ? 'bg-gray-900' : 'bg-gray-50'}`}
              onClick={() => setActiveSlot('hero')}
            >
              {newsletter.heroImage ? (
                <>
                  <img
                    src={newsletter.heroImage.url}
                    alt={newsletter.heroImage.alt}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3">
                    <div className="flex w-full items-center justify-between">
                      <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] text-white">
                        {newsletter.heroImage.source === 'gallery'
                          ? 'From gallery'
                          : 'AI generated'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeHeroImage()
                        }}
                        className="rounded bg-black/40 px-2 py-0.5 text-[10px] text-white hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">No hero image yet</p>
                    <p className="mt-1 text-xs text-gray-300">
                      Upload or generate one below
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Generation */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Generate with AI
            </p>
            <p className="mb-3 text-xs text-gray-500">
              Describe the image you want. Nano Banana Pro will create it for
              you. Be specific about style, mood, and subject.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateImage()}
                placeholder="e.g. Cinematic wide shot of a film studio with AI holographic screens..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
              <button
                onClick={generateImage}
                disabled={isGenerating || !aiPrompt.trim()}
                className="flex-shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:bg-gray-300"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating
                  </span>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Gallery upload + picker */}
        <div className="space-y-4">
          {/* Upload */}
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
              isDragActive
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-300 hover:border-brand-400'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop images here...'
                : 'Drop images to add to gallery, or click to browse'}
            </p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, GIF, WebP</p>
          </div>

          {/* Gallery grid */}
          {galleryImages.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Your Images ({galleryImages.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => selectImageForSlot(img)}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 transition hover:border-brand-400 hover:ring-2 hover:ring-brand-50"
                  >
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                      <span className="rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-800 opacity-0 transition group-hover:opacity-100">
                        Use as hero
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {galleryImages.length === 0 && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-xs text-gray-400">
                No gallery images yet. Upload some above, or generate with AI on the left.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg px-4 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100"
        >
          Back to Editing
        </button>
        <div className="flex items-center gap-3">
          {!newsletter.heroImage && (
            <span className="text-xs text-gray-400">
              You can skip this step
            </span>
          )}
          <button
            onClick={onContinue}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            {newsletter.heroImage ? 'Continue to Preview' : 'Skip to Preview'}
          </button>
        </div>
      </div>
    </StepShell>
  )
}
