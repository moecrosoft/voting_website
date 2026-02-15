import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function mustBeAdmin() {
    const cookieStore = await cookies();
    return cookieStore.get('session')?.value === 'true';
}

export async function POST(req) {
    if (!mustBeAdmin()) {
        return NextResponse.json({ error: 'Unauthorized'}, {status: 401})
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
        return NextResponse.json({error: 'No file uploaded'},{status: 400})
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes){
        return NextResponse.json({error: 'File too large (max 5MB)'},{status: 400});
    }
    if (!file.type?.startsWith('image/')){
        return NextResponse.json({error: 'Only image files allowed'},{status: 400});
    }

    const supabase = supabaseAdmin();

    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const safeExt = ext.replace(/[^a-z0-9]/g,'') || 'png';
    const filename = `${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

    const { error: upErr } = await supabase.storage
        .from('project-images')
        .upload(filename,file , {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
        });
    
    if (upErr) {
        return NextResponse.json({error: upErr.message},{status: 400})
    }

    const { data } = supabase.storage.from('project-images').getPublicUrl(filename);

    return NextResponse.json({url: data.publicUrl})
}