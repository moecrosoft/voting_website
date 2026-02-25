// /api/projects/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(req) {
  const body = await req.json();
  const { group, title, description, image_url } = body;
  const supabase = supabaseAdmin();

  const { error } = await supabase.from("projects").insert({
    group: group.trim(),
    title: title.trim(),
    description: description.trim(),
    image_url: image_url?.trim() || null,
    vote_count: 0,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const supabase = supabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  const supabase = supabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // for single project update
  const body = await req.json();

  // Handle **multiple votes at once**
  if (body.vote_ids && Array.isArray(body.vote_ids)) {
    const errors = [];
    for (const vid of body.vote_ids) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("vote_count")
          .eq("id", vid)
          .single();
        if (error) {
          errors.push(`Project ${vid}: ${error.message}`);
          continue;
        }

        const newCount = (data.vote_count || 0) + 1;
        const { error: updateError } = await supabase
          .from("projects")
          .update({ vote_count: newCount })
          .eq("id", vid);

        if (updateError) errors.push(`Project ${vid}: ${updateError.message}`);
      } catch (err) {
        errors.push(`Project ${vid}: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  }

  // Handle single project updates
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const updateData = {};
  if (body.group) updateData.group = body.group.trim();
  if (body.title) updateData.title = body.title.trim();
  if (body.description) updateData.description = body.description.trim();
  if (body.image_url) updateData.image_url = body.image_url.trim();

  if (body.vote_delta) {
    const { data, error } = await supabase
      .from("projects")
      .select("vote_count")
      .eq("id", id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    updateData.vote_count = (data.vote_count || 0) + Number(body.vote_delta);
    if (updateData.vote_count < 0) updateData.vote_count = 0;
  }

  const { error } = await supabase.from("projects").update(updateData).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}