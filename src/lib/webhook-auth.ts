import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.PATHWAY_WEBHOOK_SECRET;

/**
 * Verify the X-Pathway-Secret header on incoming webhook requests.
 * Returns null if valid, or a 401 NextResponse if invalid.
 */
export function verifyWebhookSecret(request: NextRequest): NextResponse | null {
  if (!WEBHOOK_SECRET) {
    // No secret configured — allow (dev mode fallback)
    console.warn(
      "[webhook-auth] PATHWAY_WEBHOOK_SECRET not set — skipping auth",
    );
    return null;
  }

  const provided = request.headers.get("X-Pathway-Secret") ?? "";
  if (provided !== WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: invalid or missing X-Pathway-Secret header",
      },
      { status: 401 },
    );
  }

  return null; // valid
}
