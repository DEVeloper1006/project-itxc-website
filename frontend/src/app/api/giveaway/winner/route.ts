import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL!,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN!,
});
const ENTRIES_KEY = "giveaway:entries";

export async function GET() {
  try {
    const entries = await redis.lrange(ENTRIES_KEY, 0, -1);

    if (!entries || entries.length === 0) {
      return NextResponse.json({ winner: null, totalEntries: 0 });
    }

    // The last element in the list is the first entry (we lpush)
    const firstEntry = entries[entries.length - 1];
    const parsed =
      typeof firstEntry === "string" ? JSON.parse(firstEntry) : firstEntry;

    return NextResponse.json({
      winner: {
        email: parsed.email,
        timestamp: new Date(parsed.timestamp).toISOString(),
      },
      totalEntries: entries.length,
      allEntries: entries.map((e) => {
        const p = typeof e === "string" ? JSON.parse(e) : e;
        return {
          email: p.email,
          timestamp: new Date(p.timestamp).toISOString(),
        };
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}
