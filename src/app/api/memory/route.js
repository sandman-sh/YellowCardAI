import { NextResponse } from "next/server";
import { MemWal } from "@mysten-incubation/memwal";

const DEFAULT_STATE = {
  bets: [],
  totalBets: 0,
  winRate: 0,
  recentLossesCount: 0,
  emotionalState: "STABLE",
  tiltWarningCount: 0,
  lastUpdated: null
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Sui address is required" }, { status: 400 });
    }

    const key = process.env.MEMWAL_PRIVATE_KEY;
    const accountId = process.env.MEMWAL_ACCOUNT_ID;
    const serverUrl = process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz";

    if (!key || !accountId) {
      console.warn("No Walrus Memory credentials. Returning default state.");
      return NextResponse.json({ memory: DEFAULT_STATE, blobId: null });
    }

    const memwal = MemWal.create({ key, accountId, serverUrl });

    // Recall memory for the user (using their address as the namespace)
    const recallResult = await memwal.recall({
      query: "betting history and emotional state",
      namespace: address,
      limit: 1
    });

    if (recallResult.results && recallResult.results.length > 0) {
      const latestMemory = recallResult.results[0];
      try {
        const parsedState = JSON.parse(latestMemory.text);
        return NextResponse.json({
          memory: parsedState,
          blobId: latestMemory.blob_id
        });
      } catch (parseErr) {
        console.error("Failed to parse recalled memory as JSON:", latestMemory.text, parseErr);
      }
    }

    // No memory found or parse failed
    return NextResponse.json({ memory: DEFAULT_STATE, blobId: null });

  } catch (error) {
    console.error("Error in API route /api/memory (falling back to default state):", error);
    return NextResponse.json({ memory: DEFAULT_STATE, blobId: null, warning: error.message });
  }
}

export async function POST(req) {
  try {
    const { address, memory } = await req.json();

    if (!address || !memory) {
      return NextResponse.json({ error: "Address and memory are required" }, { status: 400 });
    }

    const key = process.env.MEMWAL_PRIVATE_KEY;
    const accountId = process.env.MEMWAL_ACCOUNT_ID;
    const serverUrl = process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz";

    if (!key || !accountId) {
      console.warn("No Walrus Memory credentials. Storing locally only.");
      return NextResponse.json({ success: true, blobId: null });
    }

    const memwal = MemWal.create({ key, accountId, serverUrl });

    // Save to Walrus Memory
    const rememberResult = await memwal.remember(JSON.stringify(memory), address);
    
    // Wait for the background job to finish
    const completedJob = await memwal.waitForRememberJob(rememberResult.job_id);

    return NextResponse.json({
      success: true,
      blobId: completedJob.blob_id
    });

  } catch (error) {
    console.error("Error in POST API route /api/memory:", error);
    return NextResponse.json({ error: "Failed to write memory" }, { status: 500 });
  }
}
