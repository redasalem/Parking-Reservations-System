import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WeLink Cargo - Parking Management System',
  description:
    'Efficiently manage and reserve parking spots with the WeLink Cargo Parking Management System. Real-time zone availability, visitor and subscriber management, and flexible rate configuration.',
  keywords: [
    'parking management',
    'parking reservation',
    'WeLink Cargo',
    'smart parking',
    'parking system',
    'vehicle management',
  ],
  authors: [{ name: 'WeLink Cargo Dev Team' }],
  creator: 'WeLink Cargo',
  publisher: 'WeLink Cargo',
  openGraph: {
    title: 'WeLink Cargo Parking Management System',
    description: 'Streamline your parking operations with our advanced management system.',
    siteName: 'WeLink Cargo Parking',
    images: [
      {
        url: '/og-image.png', // Recommended: 1200x630px
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeLink Cargo Parking Management System',
    description: 'Streamline your parking operations with our advanced management system.',
    images: ['/twitter-image.png'], // Recommended: 1200x630px
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
