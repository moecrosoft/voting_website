import { requireSession } from '@/lib/requireSession';
import AdminClient from './ui';

export default async function AdminPage(){
    await requireSession();
    return <AdminClient />;
}