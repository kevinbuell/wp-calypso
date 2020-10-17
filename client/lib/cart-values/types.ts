/**
 * Internal dependencies
 */
import {
	ResponseCart,
	ResponseCartProduct,
	ResponseCartProductExtra,
} from 'calypso/lib/shopping-cart';

export type CartItemValue = ResponseCartProduct;

export type CartItemExtra = ResponseCartProductExtra;

export type CartValue = ResponseCart;
