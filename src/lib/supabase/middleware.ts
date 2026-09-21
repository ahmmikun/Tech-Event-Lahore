import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  // Fallback if environment variables are not configured in hosting environment (e.g. Vercel)
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Proxy: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (legacy NEXT_PUBLIC_SUPABASE_ANON_KEY is also supported).",
    );
    if (
      pathname.startsWith("/submit-event") ||
      pathname.startsWith("/my-events") ||
      pathname.startsWith("/admin")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // Refresh auth session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect /submit-event and /my-events
    if (
      !user &&
      (pathname.startsWith("/submit-event") ||
        pathname.startsWith("/my-events") ||
        pathname.startsWith("/admin"))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // Protect /admin routes by checking user profile role
    if (user && pathname.startsWith("/admin")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error("Middleware session update error:", error);
  }

  return supabaseResponse;
}
