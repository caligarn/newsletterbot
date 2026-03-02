'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface GalleryImage {
  id: string
  filename: string
  url: string
  tags: string[]
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [tagInput, setTagInput] = useState<Record<string, string>>({})

  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const reader = new FileReader()
      reader.onload = () => {
        const newImage: GalleryImage = {
          id: crypto.randomUUID(),
          filename: file.name,
          url: reader.result as string,
          tags: [],
        }
        setImages((prev) => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    },
  })

  function addTag(imageId: string) {
    const tag = tagInput[imageId]?.trim()
    if (!tag) return

    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId && !img.tags.includes(tag)
          ? { ...img, tags: [...img.tags, tag] }
          : img
      )
    )
    setTagInput((prev) => ({ ...prev, [imageId]: '' }))
  }

  function removeTag(imageId: string, tag: string) {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, tags: img.tags.filter((t) => t !== tag) }
          : img
      )
    )
  }

  function removeImage(imageId: string) {
    setImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Image Gallery</h1>
      <p className="mb-8 text-sm text-gray-500">
        Upload images to use in your newsletters — speaker photos, logos, event
        graphics, etc.
      </p>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`mb-8 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 hover:border-brand-400'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Drop images here...'
            : 'Drag & drop images here, or click to browse'}
        </p>
      </div>

      {/* Gallery grid */}
      {images.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p>No images yet. Upload some to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-gray-100">
                <img
                  src={img.url}
                  alt={img.filename}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-xs text-red-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
              <p className="mb-2 truncate text-xs text-gray-500">
                {img.filename}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {img.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(img.id, tag)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>

              {/* Add tag */}
              <div className="mt-2 flex gap-1">
                <input
                  type="text"
                  value={tagInput[img.id] || ''}
                  onChange={(e) =>
                    setTagInput((prev) => ({
                      ...prev,
                      [img.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && addTag(img.id)}
                  placeholder="Add tag..."
                  className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-brand-400 focus:outline-none"
                />
                <button
                  onClick={() => addTag(img.id)}
                  className="rounded bg-gray-100 px-2 text-xs text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
