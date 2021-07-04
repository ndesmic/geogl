import { deepStrictEqual } from "assert";
import { cartesianToLatLng, latLngToCartesian, normalizeNumber } from "../js/lib/math-helpers.js";

function normalizeLatLng(latlng){
	return [normalizeNumber(latlng[0], 2), normalizeNumber(latlng[1] / Math.PI), normalizeNumber(latlng[2] / Math.PI)];
}

function normalizeCartesian(cart){
	return cart.map(p => normalizeNumber(p, 2));
}

deepStrictEqual(normalizeLatLng(cartesianToLatLng([1, 0, 0])), [1,0,1]);
deepStrictEqual(normalizeLatLng(cartesianToLatLng([0, 1, 0])), [1,1,1]);
deepStrictEqual(normalizeLatLng(cartesianToLatLng([0, 0, 1])), [1,0,1]);
deepStrictEqual(normalizeLatLng(cartesianToLatLng([-1, 0, 0])), [1,0,2]);
deepStrictEqual(normalizeLatLng(cartesianToLatLng([0, -1, 0])), [1,-1,1]);
deepStrictEqual(normalizeLatLng(cartesianToLatLng([0, 0, -1])), [1,0,0]);
deepStrictEqual(normalizeLatLng(cartesianToLatLng([1, 1, 0])), [1.41,0,1]);
deepStrictEqual(normalizeLatLng(cartesianToLatLng([1, 0, 1])), [1.41,0,1]);
deepStrictEqual(normalizeLatLng(cartesianToLatLng([0, 1, 1])), [1.41,0,1]);
deepStrictEqual(normalizeCartesian(latLngToCartesian(cartesianToLatLng([1, 0, 0]))), [1,0,0]);
deepStrictEqual(normalizeCartesian(latLngToCartesian(cartesianToLatLng([0, 1, 0]))), [0,1,0]);
deepStrictEqual(normalizeCartesian(latLngToCartesian(cartesianToLatLng([0, 0, 1]))), [0,0,1]);
deepStrictEqual(normalizeCartesian(latLngToCartesian(cartesianToLatLng([-1, 0, 0]))), [-1,0,0]);
deepStrictEqual(normalizeCartesian(latLngToCartesian(cartesianToLatLng([0, -1, 0]))), [0,-1,0]);
deepStrictEqual(normalizeCartesian(latLngToCartesian(cartesianToLatLng([0, 0, -1]))), [0,0,-1]);
deepStrictEqual(normalizeCartesian(latLngToCartesian(cartesianToLatLng([1, 1, 0]))), [1,1,0]);
deepStrictEqual(normalizeCartesian(latLngToCartesian(cartesianToLatLng([1, 0, 1]))), [1,0,1]);
deepStrictEqual(normalizeCartesian(latLngToCartesian(cartesianToLatLng([0, 1, 1]))), [0,1,1]);