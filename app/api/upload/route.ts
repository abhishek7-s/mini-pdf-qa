import "server-only";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import { chunkText } from "@/lib/chunk";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const parsed = await pdf(buffer);

    const text = parsed.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Empty PDF" }, { status: 400 });
    }

    const docId = crypto.createHash("sha1").update(buffer).digest("hex");
    const chunks = chunkText(text);

    const embeddings: number[][] = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const resp = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch,
      });
      resp.data.forEach((d) => embeddings.push(d.embedding as number[]));
    }

    const rows = embeddings.map((embedding, i) => ({
      doc_id: docId,
      chunk_index: i,
      content: chunks[i],
      embedding,
    }));

    const { error } = await supabase.from("documents").insert(rows);
    if (error) throw error;

    return NextResponse.json({ ok: true, docId, chunks: chunks.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
