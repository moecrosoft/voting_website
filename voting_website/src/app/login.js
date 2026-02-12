'use server'
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function handleLogin(formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    const isUsernameValid = username === process.env.ADMIN_USERNAME;
    const isPasswordValid = bcrypt.compare(bcrypt.hash(password, 10) , process.env.ADMIN_PASSWORD);

    if (isUsernameValid && isPasswordValid) {
        const cookieStore = await cookies();

        cookieStore.set('session', 'true', {
        httpOnly: true,     // Protects against JS attacks
        secure: true,       // Only works over HTTPS
        maxAge: 3600 * 24 // Valid for 1 day (in seconds)
        });

        redirect('/adminPanel');
    }
    else {
        return { error: "Invalid credentials" };
    }
}