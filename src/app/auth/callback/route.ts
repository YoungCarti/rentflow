import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next === "/dashboard") {
        const { count } = await supabase
          .from("properties")
          .select("id", { count: "exact", head: true });

        if (count === 0) {
          return NextResponse.redirect(new URL("/onboarding/welcome", requestUrl.origin));
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  const signInUrl = new URL("/sign-in", requestUrl.origin);
  signInUrl.searchParams.set("error", "auth-callback");
  return NextResponse.redirect(signInUrl);
}
