
import SchoolHubModule from '@/components/modules/SchoolHubModule';
import { fetchSchoolUsers } from '@/lib/data/school-hub';

export default async function SchoolHubPage() {
    // Fetch initial data for the default view
    const initialUsers = await fetchSchoolUsers('Student');
    
    return <SchoolHubModule initialUsers={initialUsers} />;
}