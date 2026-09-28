import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_ERROR_LENGTH = 300;

/**
 * Sanitizes a provider/Supabase error string before reflecting it back to the
 * browser: strips control characters and caps the length so a long upstream
 * message (e.g. one containing an OAuth code) cannot bloat the redirect URL.
 */
function safeError(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length > MAX_ERROR_LENGTH
    ? `${cleaned.slice(0, MAX_ERROR_LENGTH)}...`
    : cleaned;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";

  // Ensure "next" is a relative URL to prevent open redirect vulnerabilities
  if (!next.startsWith("/")) {
    next = "/";
  }

  const redirectToLoginWithError = (message: string) =>
    NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(safeError(message) ?? "Authentication failed")}&next=${encodeURIComponent(next)}`,
    );

  // Supabase reports authorization/exchange failures by redirecting back here
  // with `error`/`error_description` and no `code`. Surface those instead of
  // silently falling through to a generic message.
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) {
    console.error("OAuth provider error:", providerError);
    return redirectToLoginWithError(providerError);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`${forwardedProto}://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error("Auth callback exchange error:", error);
      return redirectToLoginWithError(error.message);
    }
  }

  // Return the user to an error page with instructions
  return redirectToLoginWithError("Could not authenticate user");
}
