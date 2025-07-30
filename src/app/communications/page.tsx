
import CommunicationsModule from '@/components/modules/CommunicationsModule';
import { fetchEmailFolders, fetchEmails } from '@/lib/data/communications';

export default async function CommunicationsPage() {
    // Fetch initial data on the server
    const initialFolders = await fetchEmailFolders();
    const initialEmails = await fetchEmails('Inbox');
    
    return <CommunicationsModule initialFolders={initialFolders} initialEmails={initialEmails} />;
}