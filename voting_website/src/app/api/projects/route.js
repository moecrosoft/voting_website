import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function mustBeAdmin() {
    const cookieStore = await cookies();

    const ok = cookieStore.get('session')?.value === 'true';
    if (!ok) return false;
    return true;
}

export async function GET(){
    const supabase = supabaseAdmin();
    
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', {ascending: false});

    if (error) return NextResponse.json({error: error.message}, {status: 400})
    return NextResponse.json({ data });
}

export async function POST(req) {
    if (!mustBeAdmin()) {
        return NextResponse.json({error: 'Unauthorized'},{status: 401});
    }

    const body = await req.json();
    const { group, title, description, image_url } = body;

    const supabase = supabaseAdmin();

    const { error } = await supabase.from('projects').insert({
        group: group.trim(),
        title: title.trim(),
        description: description.trim(),
        image_url: image_url?.trim() || null,
        vote_count: 0
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400});
    return NextResponse.json({ ok: true })
}