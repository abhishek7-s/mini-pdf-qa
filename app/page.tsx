'use client'

import { useState } from 'react'

export default function Home() {
  const [docId, setDocId] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [answer, setAnswer] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  async function uploadPdf(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setStatus("Uploading & indexing...");

  try {
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/upload", {
      method: "POST",
      // remove Authorization if you haven’t implemented it on backend yet
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_INTERNAL_AUTH_TOKEN || ""}`,
      },
      body: form,
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      // backend didn’t return JSON
    }

    if (!res.ok) {
      setStatus(`Error: ${data.error || res.statusText || "upload failed"}`);
      return;
    }

    if (data.docId) {
      setDocId(data.docId);
    }
    setStatus("Uploaded. You can now ask questions.");
    
  } catch (err) {
    setStatus(`Error: ${(err as Error).message}`);
  }
}


  async function ask(e: React.FormEvent) {
    e.preventDefault()
    if (!docId) { setStatus('Please upload a PDF first.'); return }
    setStatus('Thinking...')
    setAnswer('')
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_INTERNAL_AUTH_TOKEN || ''}`
      },
      body: JSON.stringify({ docId, question }),
    })
    const data = await res.json()
    if (!res.ok) {
      setStatus(`Error: ${data.error || 'ask failed'}`)
      return
    }
    setAnswer(data.answer)
    setStatus('')
  }

  return (
    <main>
      <h1>Mini PDF Q&A</h1>
      <p style={{ opacity: 0.8 }}>Upload a PDF, then ask questions about its content.</p>

      <section style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12, marginTop: 16 }}>
        <form onSubmit={uploadPdf}>
          <label>PDF file:&nbsp;
            <input type="file" name="file" accept="application/pdf" required />
          </label>
          <button type="submit" style={{ marginLeft: 12 }}>Upload & Index</button>
        </form>
        {docId && <p style={{ fontSize: 12, opacity: 0.7 }}>docId: <code>{docId}</code></p>}
      </section>

      <section style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12, marginTop: 16 }}>
        <form onSubmit={ask}>
          <textarea
            placeholder="Ask a question about the PDF..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
            required
          />
          <div style={{ marginTop: 8 }}>
            <button type="submit">Ask</button>
          </div>
        </form>
        {status && <p style={{ marginTop: 8 }}>{status}</p>}
        {answer && (
          <div style={{ background: '#fafafa', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap', marginTop: 12 }}>
            {answer}
          </div>
        )}
      </section>
    </main>
  )
}
