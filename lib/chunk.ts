export function chunkText(text: string, opts = { maxTokens: 400, overlap: 40 }) {
  // naive by characters to avoid tokenizer dependency; good enough for demo
  const { maxTokens, overlap } = opts
  const size = maxTokens * 4 // ~4 chars per token heuristic
  const ov = overlap * 4
  const chunks: string[] = []
  let i = 0
  while (i < text.length) {
    const end = Math.min(i + size, text.length)
    const chunk = text.slice(i, end)
    chunks.push(chunk)
    if (end === text.length) break
    i = end - ov
    if (i < 0) i = 0
  }
  return chunks
}
