import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const GIVEAWAY_EMAIL = "krisgandhi444@gmail.com";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await resend.emails.send({
      from: "ITXC Giveaway <onboarding@resend.dev>",
      to: GIVEAWAY_EMAIL,
      subject: "ITXC Jacket Giveaway Entry",
      html: `
        <div style="font-family: monospace; background: #000; color: #fff; padding: 40px;">
          <h1 style="color: #dc2626; font-size: 28px;">Jacket Giveaway Entry</h1>
          <p style="color: #ccc; margin-top: 20px;">Someone solved the riddle.</p>
          <p style="color: #fff; font-size: 18px; margin-top: 12px;">
            <strong>Email:</strong> ${email}
          </p>
          <p style="color: #666; margin-top: 30px; font-size: 12px;">
            Sent from the ITXC website at ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send entry" },
      { status: 500 }
    );
  }
}
