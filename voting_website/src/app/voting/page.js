import { requireSession } from '@/lib/requireSession';
import VotingClient from './ui';

export default async function VotingPage() {
    await requireSession();
    return <VotingClient />;
}