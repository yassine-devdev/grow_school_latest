
import { dbEmails } from '@/lib/data/communications';
import { dbKnowledgeArticles } from '@/lib/data/knowledge';
import { dbSchoolUsers } from '@/lib/data/school-hub';

// Define interfaces for search results
interface SearchResult {
  title: string;
  snippet: string;
  id?: string;
  subject?: string;
  sender?: string;
  folder?: string;
}

interface InternalSearchResults {
  knowledgeBase: SearchResult[];
  emails: SearchResult[];
  users: SearchResult[];
}

const handleInternalSearch = async (query: string): Promise<InternalSearchResults> => {
  // Perform search across internal data sources
  const results: InternalSearchResults = {
    knowledgeBase: dbKnowledgeArticles
      .filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(a => ({ title: a.title, snippet: a.content.substring(0, 150) + '...' })),
    emails: dbEmails
      .filter(e => e.subject.toLowerCase().includes(query.toLowerCase()) || e.body.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(e => ({
        id: e.id,
        title: e.subject,
        subject: e.subject,
        sender: e.sender,
        snippet: e.body.substring(0, 100) + '...',
        folder: e.folder
      })),
    users: dbSchoolUsers
      .filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(u => ({
        id: u.id,
        title: u.name,
        snippet: `${u.role} in ${u.department} - ${u.email}`,
        name: u.name,
        role: u.role,
        email: u.email,
        department: u.department
      }))
  };
  return results;
};

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({
        error: 'Query is required and must be a string'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Perform internal search
    const results = await handleInternalSearch(query);

    return new Response(JSON.stringify({
      success: true,
      results,
      query
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Search API Error:', errorMessage);

    return new Response(JSON.stringify({
      error: 'An internal error occurred while processing the search request.',
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}