'use server'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Credential() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('session');

  // If the 'session' cookie doesn't exist, kick them out immediately
  if (!isLoggedIn) {
    redirect('/');
  }
}