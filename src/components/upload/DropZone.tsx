'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface DropZoneProps {
  onFileAccepted: (text: string) => void
  isLoading?: boolean
}

export default function DropZone({ onFileAccepted, isLoading }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        onFileAccepted(text)
      }
      reader.readAsText(file)
    },
    [onFileAccepted]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: isLoading,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-16
        text-center transition-all duration-200
        ${
          isDragActive
            ? 'border-brand-500 bg-brand-50 scale-[1.02]'
            : 'border-gray-300 bg-white hover:border-brand-400 hover:bg-gray-50'
        }
        ${isLoading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">
        <div
          className={`
            flex h-16 w-16 items-center justify-center rounded-full
            ${isDragActive ? 'bg-brand-100' : 'bg-gray-100'}
          `}
        >
          <svg
            className={`h-8 w-8 ${isDragActive ? 'text-brand-600' : 'text-gray-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-7.5a2.25 2.25 0 012.25-2.25H17.25"
            />
          </svg>
        </div>

        {isDragActive ? (
          <div>
            <p className="text-lg font-medium text-brand-700">Drop it here</p>
            <p className="mt-1 text-sm text-brand-500">Release to upload</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drag & drop your WhatsApp chat export
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Export from WhatsApp as .txt file, then drop it here or click to
              browse
            </p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span className="text-sm font-medium text-brand-700">
              Parsing chat...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
