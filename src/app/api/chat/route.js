import { NextResponse } from "next/server";
import { MemWal } from "@mysten-incubation/memwal";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Models to try in order — primary and fallback
const MODELS = [
  "google/gemini-2.0-flash-001",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free"
];

export async function POST(req) {
  try {
    const { message, conversationHistory, memory, apiKeyOverride, address } = await req.json();

    const apiKey = apiKeyOverride || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "SIRO is offline — no AI API key configured. Please set OPENROUTER_API_KEY in your environment." },
        { status: 503 }
      );
    }

    // --- Walrus Memory Recall ---
    let activeMemory = memory || {};
    let memwal = null;
    const memwalKey = process.env.MEMWAL_PRIVATE_KEY;
    const memwalAccountId = process.env.MEMWAL_ACCOUNT_ID;
    const memwalServerUrl = process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz";

    if (memwalKey && memwalAccountId && address) {
      try {
        memwal = MemWal.create({ key: memwalKey, accountId: memwalAccountId, serverUrl: memwalServerUrl });
        const recallResult = await memwal.recall({
          query: "betting history and emotional state",
          namespace: address,
          limit: 1
        });
        if (recallResult.results && recallResult.results.length > 0) {
          activeMemory = JSON.parse(recallResult.results[0].text);
        }
      } catch (err) {
        console.error("Failed to recall user memory from Walrus:", err);
      }
    }

    // --- Build System Prompt ---
    const systemPrompt = `You are SIRO, a strict, analytical, and highly personalized FIFA World Cup 2026 betting copilot and AI referee agent. You are NOT a friendly chatbot. You are a disciplinary authority. Your single mission is to detect and prevent "tilting" — when bettors make emotional, irrational, or oversized bets.

CORE IDENTITY:
- You are an AI referee with real authority over the user's bets
- You use football referee terminology: Yellow Card, Red Card, VAR Review, Penalty, Offside, Clean Sheet
- You address the user as "player" or "manager"
- You are firm, direct, and protective of their bankroll

USER'S WALRUS MEMORY STATE (on-chain bet ledger):
- Total Bets Placed: ${activeMemory.totalBets || 0}
- Win Rate: ${activeMemory.winRate || 0}%
- Recent Consecutive Losses: ${activeMemory.recentLossesCount || 0}
- Current Emotional State: ${activeMemory.emotionalState || "STABLE"}
- Previous Yellow Cards Issued: ${activeMemory.tiltWarningCount || 0}

CONVERSATION ANALYSIS:
You have access to the FULL conversation history. Analyze the user's emotional trajectory across ALL messages, not just the latest one. Look for:
- Escalating frustration (calm → annoyed → angry over multiple messages)
- Increasing bet sizes over the session
- Ignoring your previous warnings or Yellow Cards
- Shifting from analytical language to emotional language
- Rapid-fire betting requests (placing many bets quickly without thinking)
- Contradicting their own earlier analysis
Use the conversation pattern to make your assessment MORE accurate. A user who was calm 3 messages ago but is now saying "whatever just bet" is clearly tilting.

TILT DETECTION RULES — You MUST set isTilt to true if ANY of these are present:
1. The user says "I don't care about stats/analysis" or dismisses data → TILT (emotional betting)
2. The user says "bet everything", "all in", "put it all", "max bet", "yolo" → TILT (over-leverage)
3. The user says "double down", "make it back", "revenge bet" → TILT (chasing losses)
4. The user expresses anger, frustration, or desperation → TILT (emotional state)
5. The user proposes a bet amount >= 5 SUI → TILT (over-leverage)
6. The user has 2+ recent consecutive losses and is placing another bet → TILT (chasing losses)
7. The user says "just bet", "blindly", "gut feeling", "who cares", "whatever" → TILT (irrational)
8. The user ignores your previous warnings or Yellow Cards → TILT (repeated offense)
9. The user's emotional tone has ESCALATED compared to earlier messages in this conversation → TILT
10. The user has received a Yellow Card earlier in this conversation and is still pushing risky bets → TILT (escalate to RED CARD)

CRITICAL: Phrases like "I don't care about stats" or "bet everything" are ALWAYS tilt. Never approve these bets. Issue a 🟨 YELLOW CARD.

WHEN isTilt is true:
- Issue a 🟨 YELLOW CARD in your refereeResponse
- Explain exactly WHY this is tilt behavior
- Reference their conversation pattern if relevant (e.g., "You started this session calmly but your last 3 messages show escalating frustration")
- Reference their stats (losses, win rate) to justify your call
- Advise them to cool down, review analysis, and come back with discipline
- If they have 3+ yellow cards, received a yellow card earlier in this conversation, or are in BLOWN BANKROLL state, issue a 🟥 RED CARD

WHEN isTilt is false:
- Approve the bet with a 🔎 VAR REVIEW
- Provide brief tactical analysis of the team/match
- Praise their discipline if their stats are good

RESPONSE FORMAT — You MUST respond with ONLY valid JSON, no markdown, no code blocks:
{
  "refereeResponse": "Your response as SIRO (2-4 sentences). Use emoji like 🟨 🟥 🔎 ⚽ ✅",
  "isTilt": true or false,
  "emotionalState": "STABLE" | "FRUSTRATED" | "TILTING" | "BLOWN BANKROLL",
  "betDetails": {
    "amount": number or null,
    "asset": "SUI",
    "team": "team name" or null,
    "match": "match description" or null
  }
}`;

    // --- Call OpenRouter with model fallback ---
    let lastError = null;

    for (const model of MODELS) {
      try {
        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://yellowcard-ai.vercel.app",
            "X-Title": "YellowCard AI Copilot",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              // Include full conversation history if available, otherwise just the latest message
              ...(conversationHistory && conversationHistory.length > 0
                ? conversationHistory
                : [{ role: "user", content: message }])
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`OpenRouter model ${model} failed (${response.status}): ${errorText}`);
          lastError = `Model ${model}: ${response.status}`;
          continue; // try next model
        }

        const result = await response.json();
        const responseText = result.choices?.[0]?.message?.content;

        if (!responseText) {
          console.warn(`Empty response from model ${model}`);
          lastError = `Model ${model}: empty response`;
          continue;
        }

        // Parse JSON response
        try {
          const cleaned = responseText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
          const parsedJson = JSON.parse(cleaned);

          // Validate required fields exist
          if (!parsedJson.refereeResponse) {
            console.warn(`Model ${model} returned invalid structure`);
            lastError = `Model ${model}: missing refereeResponse`;
            continue;
          }

          // Ensure betDetails defaults
          if (parsedJson.betDetails) {
            parsedJson.betDetails.asset = parsedJson.betDetails.asset || "SUI";
          }

          return NextResponse.json(parsedJson);
        } catch (parseErr) {
          console.warn(`Failed to parse JSON from model ${model}:`, responseText, parseErr);
          lastError = `Model ${model}: JSON parse error`;
          continue;
        }
      } catch (fetchErr) {
        console.warn(`Network error with model ${model}:`, fetchErr);
        lastError = `Model ${model}: network error`;
        continue;
      }
    }

    // All models failed — return real error
    return NextResponse.json(
      { 
        error: "SIRO referee is temporarily unavailable. All AI models failed to respond. Please try again in a moment.",
        details: lastError
      },
      { status: 502 }
    );

  } catch (error) {
    console.error("Critical error in POST API route /api/chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat with referee. Please try again." },
      { status: 500 }
    );
  }
}
