import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage(){

  const cookieStore = await cookies();

  const session = cookieStore.get('session')?.value;

  if (session === 'true'){
    redirect('/admin');
  }
  else {
    redirect('/login')
  }
}