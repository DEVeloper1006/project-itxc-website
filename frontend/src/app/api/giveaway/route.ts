import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();
const ENTRIES_KEY = "giveaway:entries";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const entry = { email, timestamp: Date.now() };

    // lpush so the first entry stays at the end (rpop-able), but we can also
    // just read the full list and the last element is the first entry
    await redis.lpush(ENTRIES_KEY, JSON.stringify(entry));

    // Check if this is the first entry ever
    const totalEntries = await redis.llen(ENTRIES_KEY);
    const isFirst = totalEntries === 1;

    return NextResponse.json({ success: true, isFirst });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit entry" },
      { status: 500 }
    );
  }
}
