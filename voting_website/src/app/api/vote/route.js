import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function mustBeAdmin(){
    const cookieStore = await cookies();
    
    return cookieStore.get('session')?.value === 'true';
}

export async function POST(req) {
    if (!mustBeAdmin()) { 
        return NextResponse.json({error: 'Unauthorized'},{status: 401});
    }

    const { projectIds } = await req.json();

    if (!Array.isArray(projectIds) || projectIds.length < 1 || projectIds.length > 3) {
        return NextResponse.json({error: 'Select 1 to 3 projects'}, {status: 400})
    }

    const supabase = supabaseAdmin();

    for (const id of projectIds) {
        const { data, error: readErr } = await supabase
            .from('projects')
            .select('vote_count')
            .eq('id', id)
            .single();

        if (readErr) return NextResponse.json({error: readErr.message},{status: 400});

        const newCount = (data.vote_count ?? 0) + 1;

        const { error: upErr } = await supabase
            .from('projects')
            .update({ vote_count: newCount })
            .eq('id',id);

        if (upErr) return NextResponse.json({ error: upErr.message}, {status: 400});
    }

    return NextResponse.json({ ok: true })
}