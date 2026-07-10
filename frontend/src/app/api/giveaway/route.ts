import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL!,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN!,
});
const ENTRIES_KEY = "giveaway:entries";

const ANSWER_HASH =
  "4970631d26623a122f1a584518c929b1180e505bcc27369307a4aa0caa03d929";

export async function POST(request: Request) {
  try {
    const { email, answer } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!answer) {
      return NextResponse.json({ error: "Answer required" }, { status: 400 });
    }

    const hash = createHash("sha256")
      .update(answer.trim().toUpperCase())
      .digest("hex");

    if (hash !== ANSWER_HASH) {
      return NextResponse.json({ error: "Wrong answer" }, { status: 403 });
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
