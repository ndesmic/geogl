export const TWO_PI = Math.PI * 2
export const QUARTER_TURN = Math.PI / 2;

export function normalizeAngle(angle) {
	if (angle < 0) {
		return TWO_PI - (Math.abs(angle) % TWO_PI);
	}
	return angle % TWO_PI;
}

export function radToDegrees(rad){
	return rad * 180/Math.PI;
}

export function cartesianToLatLng([x, y, z]) {
	const radius = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
	return [
		radius,
		normalizeAngle((Math.PI / 2) - Math.acos(y / radius)),
		normalizeAngle(Math.atan2(x, -z)),
	];
}

export function latLngToCartesian([radius, lat, lng]){
	lng = -lng + Math.PI / 2;
	return [
		radius * Math.cos(lat) * Math.cos(lng),
		radius * Math.sin(lat),
		radius * -Math.cos(lat) * Math.sin(lng),
	];
}