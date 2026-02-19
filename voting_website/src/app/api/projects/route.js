import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function mustBeAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value === 'true';
}

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(req) {
  if (!(await mustBeAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { group, title, description, image_url } = body;
  const supabase = supabaseAdmin();

  const { error } = await supabase.from('projects').insert({
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
  if (!(await mustBeAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  if (!(await mustBeAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();
  const updateData = {};
  if (body.group) updateData.group = body.group.trim();
  if (body.title) updateData.title = body.title.trim();
  if (body.description) updateData.description = body.description.trim();
  if (body.image_url) updateData.image_url = body.image_url.trim();

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("projects").update(updateData).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
