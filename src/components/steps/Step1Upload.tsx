'use client'

import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import StepShell from '../stepper/StepShell'

interface Step1UploadProps {
  onFileAccepted: (text: string) => void
  error?: string | null
}

export default function Step1Upload({ onFileAccepted, error: externalError }: Step1UploadProps) {
  const [localError, setLocalError] = useState<string | null>(null)
  const displayError = externalError || localError

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      setLocalError(null)

      if (rejections.length > 0) {
        setLocalError('Please upload a .txt file exported from WhatsApp.')
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        if (!text || text.trim().length === 0) {
          setLocalError('The file appears to be empty. Please try a different export.')
          return
        }
        onFileAccepted(text)
      }
      reader.onerror = () => {
        setLocalError('Failed to read the file. Please try again.')
      }
      reader.readAsText(file)
    },
    [onFileAccepted]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Accept .txt files with any MIME type (WhatsApp exports sometimes
    // come through with no MIME or application/octet-stream)
    accept: {
      'text/plain': ['.txt'],
      'application/octet-stream': ['.txt'],
      'text/*': ['.txt'],
    },
    maxFiles: 1,
    // Also allow files by extension when MIME detection fails
    validator: (file) => {
      if (file.name && !file.name.toLowerCase().endsWith('.txt')) {
        return { code: 'wrong-type', message: 'File must be a .txt file' }
      }
      return null
    },
  })

  return (
    <StepShell
      title="Upload Your Chat"
      subtitle="Start by exporting a conversation from WhatsApp and dropping the file here."
      tip="In WhatsApp, open a group chat, tap the three-dot menu (or group name on iOS), scroll down to 'Export Chat', choose 'Without Media', and save the .txt file."
    >
      {/* How it works mini-guide */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            num: '1',
            title: 'Export from WhatsApp',
            desc: 'Open any group chat and export it as a .txt file',
          },
          {
            num: '2',
            title: 'AI Reads & Structures',
            desc: "We'll analyze the conversation and pull out key moments",
          },
          {
            num: '3',
            title: 'You Edit & Publish',
            desc: 'Refine the newsletter, add images, and export to Substack',
          },
        ].map((item) => (
          <div
            key={item.num}
            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {item.num}
            </div>
            <p className="text-sm font-semibold text-gray-800">{item.title}</p>
            <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          cursor-pointer rounded-2xl border-2 border-dashed p-12
          text-center transition-all duration-200
          ${
            isDragActive
              ? 'border-brand-500 bg-brand-50 scale-[1.01]'
              : 'border-gray-300 bg-white hover:border-brand-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              isDragActive ? 'bg-brand-100' : 'bg-gray-100'
            }`}
          >
            <svg
              className={`h-7 w-7 ${isDragActive ? 'text-brand-600' : 'text-gray-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          {isDragActive ? (
            <p className="text-base font-medium text-brand-700">Drop it here!</p>
          ) : (
            <>
              <p className="text-base font-medium text-gray-700">
                Drag & drop your WhatsApp .txt export
              </p>
              <p className="text-xs text-gray-400">or click to browse files</p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {displayError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {displayError}
        </div>
      )}
    </StepShell>
  )
}
