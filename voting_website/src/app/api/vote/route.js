import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function mustBeAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value === "true";
}

export async function POST(req) {
  if (!mustBeAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const projectIdsRaw = body?.projectIds;

  if (!Array.isArray(projectIdsRaw) || projectIdsRaw.length < 1 || projectIdsRaw.length > 3) {
    return NextResponse.json(
      { error: "Select 1 to 3 projects" },
      { status: 400 }
    );
  }

  // convert to bigint-safe numbers
  const projectIds = projectIdsRaw.map(id => Number(id));

  if (projectIds.some(id => !Number.isFinite(id))) {
    return NextResponse.json(
      { error: "Invalid project IDs" },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();

  const { error } = await supabase.rpc("increment_votes", {
    project_ids: projectIds,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
