export const metadata = { title: 'Mini PDF Q&A', description: 'Upload a PDF and ask questions about it.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: 16 }}>
        {children}
      </body>
    </html>
  )
}
