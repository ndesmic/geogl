import { cartesianToLatLng, latLngToCartesian } from "../js/lib/trig.js";

console.log(cartesianToLatLng([1, 0, 0]));
console.log(cartesianToLatLng([0, 1, 0]));
console.log(cartesianToLatLng([0, 0, 1]));

console.log(cartesianToLatLng([-1, 0, 0]));
console.log(cartesianToLatLng([0, -1, 0]));
console.log(cartesianToLatLng([0, 0, -1]));

console.log(cartesianToLatLng([1, 1, 0]));
console.log(cartesianToLatLng([1, 0, 1]));
console.log(cartesianToLatLng([0, 1, 1]));

console.log("UNDO")
console.log(latLngToCartesian(cartesianToLatLng([1, 0, 0])));
console.log(latLngToCartesian(cartesianToLatLng([0, 1, 0])));
console.log(latLngToCartesian(cartesianToLatLng([0, 0, 1])));

console.log(latLngToCartesian(cartesianToLatLng([-1, 0, 0])));
console.log(latLngToCartesian(cartesianToLatLng([0, -1, 0])));
console.log(latLngToCartesian(cartesianToLatLng([0, 0, -1])));

console.log(latLngToCartesian(cartesianToLatLng([1, 1, 0])));
console.log(latLngToCartesian(cartesianToLatLng([1, 0, 1])));
console.log(latLngToCartesian(cartesianToLatLng([0, 1, 1])));