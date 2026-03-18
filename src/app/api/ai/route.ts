import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ response: "ANTHROPIC_API_KEY not configured. Add it to your environment to enable AI features." }, { status: 200 });
  }

  const { system, message, messages: conversationMessages } = await req.json();

  // Build messages array: either a full conversation history or a single message
  const apiMessages = conversationMessages
    ? conversationMessages.map((m: { role: string; text: string }) => ({ role: m.role, content: m.text }))
    : [{ role: "user", content: message }];

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: system || "You are a helpful marketing assistant.",
        messages: apiMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ response: `API error: ${err}` }, { status: 200 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "No response";
    return NextResponse.json({ response: text });
  } catch (e) {
    return NextResponse.json({ response: `Error: ${e instanceof Error ? e.message : "Unknown"}` }, { status: 200 });
  }
}
