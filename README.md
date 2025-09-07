# Mini PDF Q&A App

This is a mini PDF Question & Answer application built with **Next.js, OpenAI, and Supabase (pgvector)**.  
It allows users to upload a PDF, process its contents, and then ask questions about the document using **retrieval-augmented generation (RAG)** powered by OpenAI.

---

## Stack
- **Next.js App Router** (Route Handlers, Node.js runtime)
- **OpenAI**:  
  - `text-embedding-3-small` for embeddings  
  - `gpt-4o-mini` for answers
- **Supabase (Postgres + pgvector)** for vector search
- **pdf-parse** for text extraction
- **Simple auth**: Bearer token via `INTERNAL_AUTH_TOKEN` in Middleware (demo-only)

---

## Quickstart

1. **Enable pgvector in Supabase**
   Run in Supabase SQL editor:
   ```sql
   create extension if not exists vector;

   create table documents (
     id uuid primary key default gen_random_uuid(),
     doc_id text,
     chunk_index int,
     content text,
     embedding vector(1536)
   );

2. **Clone & install**
   ```bash
   git clone <your-repo-url>
   cd pdf-qa-app
   pnpm i   # or npm i / yarn

3. **Configure env**
   Copy .env.example → .env.local and fill in:
   ```ini
   OPENAI_API_KEY=
   # Simple bearer token to protect /api routes
   INTERNAL_AUTH_TOKEN=dev-secret
   NEXT_PUBLIC_INTERNAL_AUTH_TOKEN=dev-secret
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   
4. **Run locally**
   ```bash
   pnpm dev # or npm run dev / yarn dev
## How it works
   
### `POST /api/upload` (protected)
- Accepts a PDF file (`file`)
- Extracts text using **pdf-parse**
- Splits text into overlapping chunks
- Generates embeddings with **OpenAI**
- Stores each chunk in Supabase with:
  - `docId`
  - `chunk_index`
  - `content`
  - `embedding`
- Returns:
  ```json
  { "docId": "<generated-doc-id>" }

### `POST /api/ask` (protected)
- Embeds the user’s question
- Runs vector similarity search using Supabase (match_documents RPC)
- Concatenates top matching chunks as context
- Calls gpt-4o-mini with:
  - `context`
  - `question`
- Returns:
  ```json
  { "answer": "Generated grounded answer" }


## Notes & Tradeoffs
- Chunking: uses simple character-based chunking with overlap.
- Auth: demo protection via Bearer token (`INTERNAL_AUTH_TOKEN`).
  - For production, replace with real auth (NextAuth, Clerk, or JWTs).
  - Never expose secrets with `NEXT_PUBLIC_*` outside of demos.
- Runtime: API routes run with Node.js runtime (needed by pdf-parse).

## Scripts
```bash
pnpm dev     # run locally in dev mode
pnpm build   # production build
pnpm start   # run production server
