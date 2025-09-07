import "server-only";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { docId, question } = await req.json();
    if (!docId || !question) {
      return NextResponse.json({ error: "docId & question required" }, { status: 400 });
    }

    // Embed the question
    const embedResp = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });
    const queryEmbedding = embedResp.data[0].embedding;

    // Search similar chunks using pgvector
    const { data: matches, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_count: 3,
      filter_doc_id: docId,
    });
    if (error) throw error;

    const context = matches.map((m: any) => m.content).join("\n");

    // RAG with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Answer the question using the provided context." },
        { role: "user", content: `Context:\n${context}\n\nQuestion:\n${question}` },
      ],
    });

    const answer = completion.choices[0].message?.content || "No answer found";
    return NextResponse.json({ answer });
  } catch (e: any) {
    console.error("Ask error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
