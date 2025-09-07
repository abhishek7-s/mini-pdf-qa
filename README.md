# Mini PDF Q&A (Next.js + OpenAI + Pinecone)

Upload a PDF, we extract & chunk its text, embed with OpenAI, store vectors in Pinecone, and answer your questions with retrieval-augmented generation (RAG).

## Stack
- **Next.js App Router** (Route Handlers)
- **OpenAI**: `text-embedding-3-small` for embeddings, `gpt-4o-mini` for answers
- **Pinecone** serverless index for vector search
- **pdf-parse** for text extraction
- **Simple auth**: Bearer token via `INTERNAL_AUTH_TOKEN` in Middleware

## Quickstart

1. **Create Pinecone index** (1536 dimension for `text-embedding-3-small`, metric cosine):
   - Name: `pdf-qa` (or change `PINECONE_INDEX`)
   - Serverless region: any
   - Dimension: **1536**

2. **Clone & install**
   ```bash
   pnpm i   # or npm i / yarn
   ```

3. **Configure env**
   Copy `.env.example` to `.env.local` and fill:
   ```ini
   OPENAI_API_KEY=sk-...
   PINECONE_API_KEY=pcn-...
   PINECONE_INDEX=pdf-qa
   INTERNAL_AUTH_TOKEN=dev-secret
   # client-side header for demo (not for prod)
   NEXT_PUBLIC_INTERNAL_AUTH_TOKEN=dev-secret
   ```

4. **Run**
   ```bash
   pnpm dev
   ```
   Open http://localhost:3000

## How it works

- `POST /api/upload` (protected) accepts a PDF (`file`), extracts text with `pdf-parse`, chunks it, embeds chunks in batches with OpenAI, and upserts vectors into Pinecone under a unique `docId` namespace (hash of the PDF). Returns `{ docId }`.
- `POST /api/ask` (protected) embeds the question, queries Pinecone (`topK=6`), concatenates the best chunk texts as **context**, and calls `gpt-4o-mini` to answer grounded to the context. If nothing relevant, it admits that.

## Notes & Tradeoffs
- Character-based chunking with overlap is used for simplicity.
- We use a simple **Bearer token** in middleware to protect `/api/*`. For a production app, replace this with real auth (e.g., NextAuth, Clerk, or JWTs) and never expose secrets via `NEXT_PUBLIC_*` in the client. This is solely to satisfy "protected routes" in a quick demo.
- Route handlers run on **Node.js runtime** (required by `pdf-parse`).

## Scripts
- `dev` – run locally
- `build` – production build
- `start` – run production server

## Cleanup
To remove a document, delete its namespace (`docId`) from Pinecone via the dashboard or SDK.

## License
MIT
