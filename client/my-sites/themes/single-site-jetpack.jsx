/**
 * External dependencies
 */

import React from 'react';
import { pickBy } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import CurrentTheme from 'my-sites/themes/current-theme';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import ThanksModal from 'my-sites/themes/thanks-modal';
import AutoLoadingHomepageModal from 'my-sites/themes/auto-loading-homepage-modal';
import config from 'config';
import { isPartnerPurchase } from 'lib/purchases';
import JetpackReferrerMessage from './jetpack-referrer-message';
import { connectOptions } from './theme-options';
import UpsellNudge from 'blocks/upsell-nudge';
import {
	FEATURE_UNLIMITED_PREMIUM_THEMES,
	PLAN_JETPACK_SECURITY_REALTIME,
} from 'lib/plans/constants';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';
import ThemesSelection from './themes-selection';
import { addTracking } from './helpers';
import { getCurrentPlan, hasFeature, isRequestingSitePlans } from 'state/sites/plans/selectors';
import { getByPurchaseId } from 'state/purchases/selectors';
import { getLastThemeQuery, getThemesFoundForQuery } from 'state/themes/selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSiteMultiSite } from 'state/sites/selectors';

const ConnectedThemesSelection = connectOptions( ( props ) => {
	return (
		<ThemesSelection
			{ ...props }
			getOptions={ function ( theme ) {
				return pickBy(
					addTracking( props.options ),
					( option ) => ! ( option.hideForTheme && option.hideForTheme( theme, props.siteId ) )
				);
			} }
		/>
	);
} );

const ConnectedSingleSiteJetpack = connectOptions( ( props ) => {
	const {
		analyticsPath,
		analyticsPageTitle,
		currentPlan,
		emptyContent,
		filter,
		getScreenshotOption,
		purchase,
		showWpcomThemesList,
		search,
		siteId,
		vertical,
		tier,
		translate,
		hasUnlimitedPremiumThemes,
		requestingSitePlans,
		siteSlug,
	} = props;
	const jetpackEnabled = config.isEnabled( 'manage/themes-jetpack' );

	if ( ! jetpackEnabled ) {
		return (
			<JetpackReferrerMessage
				siteId={ siteId }
				analyticsPath={ analyticsPath }
				analyticsPageTitle={ analyticsPageTitle }
			/>
		);
	}

	const isPartnerPlan = purchase && isPartnerPurchase( purchase );

	return (
		<Main className="themes">
			<SidebarNavigation />
			<FormattedHeader
				brandFont
				className="themes__page-heading"
				headerText={ translate( 'Themes' ) }
				align="left"
			/>
			<CurrentTheme siteId={ siteId } />
			{ ! requestingSitePlans && currentPlan && ! hasUnlimitedPremiumThemes && ! isPartnerPlan && (
				<UpsellNudge
					forceDisplay
					title={ translate( 'Get unlimited premium themes' ) }
					description={ translate(
						'In addition to our collection of premium themes, get comprehensive WordPress' +
							' security, real-time backups, and unlimited video hosting.'
					) }
					event="themes_plans_free_personal_premium"
					showIcon={ true }
					href={ `/checkout/${ siteSlug }/${ PLAN_JETPACK_SECURITY_REALTIME }` }
				/>
			) }
			<ThemeShowcase
				{ ...props }
				siteId={ siteId }
				emptyContent={ showWpcomThemesList ? <div /> : null }
			>
				{ siteId && <QuerySitePlans siteId={ siteId } /> }
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				<ThanksModal source={ 'list' } />
				<AutoLoadingHomepageModal source={ 'list' } />
				{ showWpcomThemesList && (
					<div>
						<ConnectedThemesSelection
							origin="wpcom"
							defaultOption={ 'activate' }
							secondaryOption={ 'tryandcustomize' }
							search={ search }
							tier={ tier }
							filter={ filter }
							vertical={ vertical }
							siteId={ siteId /* This is for the options in the '...' menu only */ }
							getScreenshotUrl={ function ( theme ) {
								if ( ! getScreenshotOption( theme ).getUrl ) {
									return null;
								}
								return getScreenshotOption( theme ).getUrl( theme );
							} }
							onScreenshotClick={ function ( themeId ) {
								if ( ! getScreenshotOption( themeId ).action ) {
									return;
								}
								getScreenshotOption( themeId ).action( themeId );
							} }
							getActionLabel={ function ( theme ) {
								return getScreenshotOption( theme ).label;
							} }
							trackScrollPage={ props.trackScrollPage }
							source="wpcom"
							emptyContent={ emptyContent }
						/>
					</div>
				) }
			</ThemeShowcase>
		</Main>
	);
} );

export default connect( ( state, { siteId, tier } ) => {
	const siteSlug = getSelectedSiteSlug( state );
	const currentPlan = getCurrentPlan( state, siteId );
	const isMultisite = isJetpackSiteMultiSite( state, siteId );
	const showWpcomThemesList = ! isMultisite;
	let emptyContent = null;
	if ( showWpcomThemesList ) {
		const siteQuery = getLastThemeQuery( state, siteId );
		const wpcomQuery = getLastThemeQuery( state, 'wpcom' );
		const siteThemesCount = getThemesFoundForQuery( state, siteId, siteQuery );
		const wpcomThemesCount = getThemesFoundForQuery( state, 'wpcom', wpcomQuery );
		emptyContent = ! siteThemesCount && ! wpcomThemesCount ? null : <div />;
	}
	return {
		currentPlan,
		purchase: currentPlan ? getByPurchaseId( state, currentPlan.id ) : null,
		tier,
		showWpcomThemesList,
		emptyContent,
		isMultisite,
		hasUnlimitedPremiumThemes: hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ),
		requestingSitePlans: isRequestingSitePlans( state, siteId ),
		siteSlug,
	};
} )( ConnectedSingleSiteJetpack );
