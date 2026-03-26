import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { ClientProvider } from '@/lib/client-context'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'Lanbow 3.0',
  description: 'Lanbow client management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body>
        <ClientProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-grey-01 focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
          >
            跳至主内容
          </a>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-[var(--width-sidebar)]">
              <TopNav />
              <main id="main-content" className="flex-1 px-5 py-4 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </ClientProvider>
      </body>
    </html>
  )
}
