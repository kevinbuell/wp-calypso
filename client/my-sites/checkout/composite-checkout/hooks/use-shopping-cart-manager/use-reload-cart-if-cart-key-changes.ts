/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

/**
 * Internal dependencies
 */
import { ReloadCartFromServer } from './types';

export default function useReloadCartIfCartKeyChanges(
	cartKey: string | number | null | undefined,
	reloadFromServer: ReloadCartFromServer
): void {
	const previousCartKey = useRef( cartKey );
	useEffect( () => {
		if ( cartKey !== previousCartKey.current ) {
			previousCartKey.current = cartKey;
			reloadFromServer();
		}
	}, [ cartKey, reloadFromServer ] );
}
