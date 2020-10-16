/**
 * Internal dependencies
 */
import { SiteData } from 'calypso/state/ui/selectors/site-data';
import CartStore from 'calypso/lib/cart/store';

export default function getCartKey( {
	selectedSite,
	isLoggedOutCart,
	isNoSiteCart,
}: {
	selectedSite: SiteData;
	isLoggedOutCart: boolean;
	isNoSiteCart: boolean;
} ): string | number | undefined {
	// We have to monitor the old cart manager in case it's waiting on a
	// requested change. To prevent race conditions, we will return undefined in
	// that case, which will cause the ShoppingCartProvider to wait.
	const oldCart = CartStore.get();
	const isOldCartPendingUpdate = oldCart?.hasPendingServerUpdates;
	if ( isOldCartPendingUpdate ) {
		return undefined;
	}

	let siteSlug = selectedSite?.slug;
	if ( ! siteSlug ) {
		siteSlug = 'no-site';
		if ( isLoggedOutCart || isNoSiteCart ) {
			siteSlug = 'no-user';
		}
	}

	return isLoggedOutCart || isNoSiteCart ? siteSlug : selectedSite?.ID;
}
