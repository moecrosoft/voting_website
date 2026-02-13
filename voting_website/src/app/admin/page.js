import { requireSession } from '@/lib/requireSession';
import AdminClient from './ui';

export default function AdminPage(){
    requireSession();
    return <AdminClient />;
}