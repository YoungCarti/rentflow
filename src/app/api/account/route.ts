import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAYMENT_PROOFS_BUCKET = "payment-proofs";
const USER_OWNED_TABLES = [
  "payments",
  "rent_records",
  "maintenance_requests",
  "tenants",
  "units",
  "properties",
] as const;

type PaymentProofRow = {
  proof_url: string | null;
};

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getConfirmation(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || !("confirm" in body)) {
      return "";
    }

    const confirm = (body as { confirm?: unknown }).confirm;
    return typeof confirm === "string" ? confirm : "";
  } catch {
    return "";
  }
}

function isConstraintError(error: { message?: string }) {
  return /constraint|foreign key|violat/i.test(error.message ?? "");
}

async function getPaymentProofPaths(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
) {
  const { data, error } = await admin
    .from("payments")
    .select("proof_url")
    .eq("user_id", userId)
    .not("proof_url", "is", null);

  if (error) {
    throw new Error(`Unable to load payment proof paths: ${error.message}`);
  }

  return Array.from(
    new Set(
      ((data ?? []) as PaymentProofRow[])
        .map((row) => row.proof_url)
        .filter((path): path is string => Boolean(path))
    )
  );
}

async function deleteUserOwnedRows(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
) {
  for (const table of USER_OWNED_TABLES) {
    const { error } = await admin.from(table).delete().eq("user_id", userId);

    if (error) {
      throw new Error(`Unable to delete ${table}: ${error.message}`);
    }
  }
}

async function deletePaymentProofs(
  admin: ReturnType<typeof createAdminClient>,
  proofPaths: string[]
) {
  for (let index = 0; index < proofPaths.length; index += 100) {
    const chunk = proofPaths.slice(index, index + 100);
    const { error } = await admin.storage.from(PAYMENT_PROOFS_BUCKET).remove(chunk);

    if (error) {
      console.error("Unable to delete payment proof files", error);
    }
  }
}

export async function DELETE(request: NextRequest) {
  const confirm = await getConfirmation(request);

  if (confirm !== "DELETE") {
    return NextResponse.json(
      { message: "Type DELETE to confirm account deletion." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { message: "You must be signed in to delete your account." },
      { status: 401 }
    );
  }

  try {
    const admin = createAdminClient();
    const proofPaths = await getPaymentProofPaths(admin, user.id);
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      if (!isConstraintError(deleteError)) {
        throw new Error(deleteError.message);
      }

      await deleteUserOwnedRows(admin, user.id);

      const { error: retryError } = await admin.auth.admin.deleteUser(user.id);

      if (retryError) {
        throw new Error(retryError.message);
      }
    }

    await deletePaymentProofs(admin, proofPaths);
    await supabase.auth.signOut({ scope: "local" });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to delete account.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
