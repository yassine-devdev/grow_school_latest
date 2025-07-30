
import MarketplaceModule from '@/components/modules/MarketplaceModule';
import { fetchMarketplaceProducts } from '@/lib/data/marketplace';

export default async function MarketplacePage() {
    // Fetch initial data on the server
    const initialProducts = await fetchMarketplaceProducts('All Products');
    
    return <MarketplaceModule initialProducts={initialProducts} />;
}