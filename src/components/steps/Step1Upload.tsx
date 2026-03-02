'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import StepShell from '../stepper/StepShell'

interface Step1UploadProps {
  onFileAccepted: (text: string) => void
}

export default function Step1Upload({ onFileAccepted }: Step1UploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => onFileAccepted(reader.result as string)
      reader.readAsText(file)
    },
    [onFileAccepted]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1,
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
    </StepShell>
  )
}
