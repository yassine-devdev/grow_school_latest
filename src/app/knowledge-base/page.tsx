import KnowledgeBaseModule from '@/components/modules/KnowledgeBaseModule';

export default function KnowledgeBasePage() {
    // This page now renders a pure client component.
    // All data fetching and AI interaction is handled by the component
    // via a secure API route, improving security and performance.
    return <KnowledgeBaseModule />;
}