import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Josefin_Sans, Noto_Sans_Armenian } from 'next/font/google'
import { LanguageProvider } from '@/lib/i18n'
import { SiteBanner } from '@/components/site-banner'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const josefin = Josefin_Sans({ subsets: ['latin'], weight: ['600'], variable: '--font-josefin' })
const armenian = Noto_Sans_Armenian({ subsets: ['armenian'], variable: '--font-armenian' })

export const metadata: Metadata = {
  title: 'Glendale BizPath',
  description: 'Business rules, permits and licenses in the Jewel City. A hackathon prototype, not an official City of Glendale website.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#12343B',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${inter.variable} ${josefin.variable} ${armenian.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <LanguageProvider>
          <SiteBanner />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
