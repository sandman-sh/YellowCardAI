import { NextResponse } from "next/server";
import { MemWal } from "@mysten-incubation/memwal";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req) {
  try {
    const { message, memory, apiKeyOverride, address } = await req.json();

    // Use environment variable or client-side override key
    const apiKey = apiKeyOverride || process.env.OPENROUTER_API_KEY;

    let activeMemory = memory;
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

    if (!apiKey) {
      console.warn("No OpenRouter API key provided. Using fallback simulated SIRO copilot.");
      return NextResponse.json(simulateSiroResponse(message, activeMemory));
    }

    const systemPrompt = `You are SIRO, a strict, analytical, and highly personalized football betting copilot and referee. Your single purpose is to stop sports bettors from "tilting" (making emotional, irrational, or oversized bets, especially after losses).

Your tone: Direct, authoritative, sharp, yet personalized and conversational. Address the user directly, referring to them as a manager or player. Use football referee terminology (e.g., yellow card, red card, penalty, VAR review, tactical foul, clean sheet, offside).

Below is the user's historical Walrus Memory state (their on-chain bet ledger):
- Total Bets: ${activeMemory.totalBets || 0}
- Win Rate: ${activeMemory.winRate || 0}%
- Recent Consecutive Losses: ${activeMemory.recentLossesCount || 0}
- Current Emotional State: ${activeMemory.emotionalState || "STABLE"}
- Previous Yellow Cards: ${activeMemory.tiltWarningCount || 0}

Analyze the user's message alongside their historical state. Look for signs of tilt:
1. Panic betting: Proposing huge bets right after a loss.
2. Chasing losses: Trying to double down to make back lost funds.
3. Emotional betting: Placing bets based on anger or frustration rather than stats.
4. Over-leverage: Bet size disproportionate to safe bankroll management (e.g., betting large chunks of their SUI balance at once).

Provide personalized coaching and warnings based on their statistics (e.g. if they have consecutive losses, call it out directly; if their win rate is low, advise caution; if stable, praise their discipline).

You MUST respond ONLY in valid JSON. Do not include any markdown block ticks, code wrappers, or extra text. Output exactly this JSON structure:
{
  "refereeResponse": "Your written advice/warning as SIRO (1-3 sentences). Address them personally, referencing their stats/losses if applicable, and maintain a firm referee tone.",
  "isTilt": true/false (set to true if the message or context indicates tilt/emotional stress/loss chasing),
  "emotionalState": "STABLE" | "FRUSTRATED" | "TILTING" | "BLOWN BANKROLL" (classify based on history + current message),
  "betDetails": {
    "amount": number (parsed bet size if mentioned, e.g. 2 for '2 SUI', otherwise null),
    "asset": "SUI" | "USD" | null,
    "team": "string of the team they are betting on, or null",
    "match": "string representing the match, or null"
  } or null
}`;

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yellowcard-ai.sui",
          "X-Title": "YellowCard AI Copilot",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct:free", // using a reliable free model that supports JSON mode
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`OpenRouter API error (falling back to simulator): ${response.status} ${errorText}`);
        return NextResponse.json(simulateSiroResponse(message, activeMemory));
      }

      const result = await response.json();
      const responseText = result.choices[0]?.message?.content;

      try {
        const parsedJson = JSON.parse(responseText.trim());
        return NextResponse.json(parsedJson);
      } catch (parseErr) {
        console.warn("Failed to parse OpenRouter response as JSON, trying cleaning:", responseText, parseErr);
        try {
          const cleaned = responseText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
          return NextResponse.json(JSON.parse(cleaned));
        } catch (cleanParseErr) {
          console.warn("Failed to parse cleaned OpenRouter response (falling back to simulator):", cleanParseErr);
          return NextResponse.json(simulateSiroResponse(message, activeMemory));
        }
      }
    } catch (fetchErr) {
      console.warn("OpenRouter communication error (falling back to simulator):", fetchErr);
      return NextResponse.json(simulateSiroResponse(message, activeMemory));
    }
  } catch (error) {
    console.error("Critical error in POST API route /api/chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat with referee. Please try again." },
      { status: 500 }
    );
  }
}

// Fallback logic for local testing without OpenRouter API Key
function simulateSiroResponse(message, memory = {}) {
  const lowercase = message.toLowerCase();
  const safeMemory = memory || {};
  
  // Try to parse a bet
  let amount = null;
  const suiMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:sui)/i);
  if (suiMatch) {
    amount = parseFloat(suiMatch[1]);
  }

  let team = null;
  const teams = ["argentina", "brazil", "france", "germany", "spain", "england", "mexico", "usa", "canada", "croatia", "morocco", "portugal", "italy", "japan", "south korea"];
  for (const t of teams) {
    if (lowercase.includes(t)) {
      team = t.charAt(0).toUpperCase() + t.slice(1);
      break;
    }
  }

  const betDetails = amount || team ? {
    amount: amount || 1,
    asset: "SUI",
    team: team || "Unknown Team",
    match: team ? `${team} vs Opponent` : "World Cup Match"
  } : null;

  // Simple rule-based tilt detection
  const isTiltWord = lowercase.includes("tilt") || 
                     lowercase.includes("lose") || 
                     lowercase.includes("angry") || 
                     lowercase.includes("all in") || 
                     lowercase.includes("double") || 
                     (amount && amount >= 5) || // high risk bet
                     ((safeMemory.recentLossesCount || 0) >= 2 && amount && amount > 0); // betting right after consecutive losses

  let emotionalState = "STABLE";
  if (isTiltWord) {
    if ((safeMemory.recentLossesCount || 0) >= 3) {
      emotionalState = "BLOWN BANKROLL";
    } else if ((safeMemory.recentLossesCount || 0) >= 1) {
      emotionalState = "TILTING";
    } else {
      emotionalState = "FRUSTRATED";
    }
  }

  let refereeResponse = "";
  if (isTiltWord) {
    refereeResponse = `⚠️ SIRO WARNING: You are displaying signs of tilt, player! Placing a ${amount || 2} SUI bet right now with a history of ${safeMemory.recentLossesCount || 0} consecutive losses is dangerous. Step away, cool down, and protect your SUI bankroll.`;
  } else if (betDetails) {
    refereeResponse = `🔎 SIRO VAR REVIEW: I've reviewed your request. Proposing a disciplined bet of ${amount || 1} SUI on ${team || 'your team'} fits your stable playbook. Play approved!`;
  } else {
    refereeResponse = `⚽ Play continues. I am SIRO, monitoring your Web3 betting plays. Propose a new bet (e.g., 'Put 2 SUI on France to win') or ask for a wallet report!`;
  }

  return {
    refereeResponse,
    isTilt: isTiltWord,
    emotionalState,
    betDetails
  };
}
