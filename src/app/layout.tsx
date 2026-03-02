import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Newsletter Generator',
  description: 'Turn WhatsApp chats into polished Substack newsletters',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <a href="/" className="text-lg font-semibold text-gray-900">
                Newsletter Generator
              </a>
              <div className="flex items-center gap-4">
                <a
                  href="/gallery"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Image Gallery
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
