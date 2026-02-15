import { requireSession } from '@/lib/requireSession';
import LeaderboardPage from './ui';

export default async function VotingPage() {
    await requireSession();
    return <LeaderboardPage />;
}