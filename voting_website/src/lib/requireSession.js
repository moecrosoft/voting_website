import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireSession(){

    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (session !== 'true') redirect('/login');
}