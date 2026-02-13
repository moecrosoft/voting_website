import { requireSession } from '@/lib/requireSession';
import VotingClient from './ui';

export default function VotingPage() {
    requireSession();
    return <VotingClient />;
}