import { deepStrictEqual } from "assert";
import { normalizeNumber } from "../js/lib/math-helpers.js";
import { uvSphere, facetSphere } from "../js/lib/shape-gen.js";

const two = uvSphere(2);
deepStrictEqual(two.positions.map(p => normalizeNumber(p, 2)), [
	0, -1, 0,
	0, -1, 0,
	0, -1, 0,
	0, -1, 0,
	0, 0, -1,
	1, 0, 0,
	0, 0, 1,
	-1, 0, 0,
	0, 0, -1,
	0, 1, 0,
	0, 1, 0,
	0, 1, 0,
	0, 1, 0,
], "positions did not match for density 2");
deepStrictEqual(two.triangles, [
	0, 5, 4,
	1, 6, 5,
	2, 7, 6,
	3, 8, 7,
	4, 5, 9,
	5, 6, 10,
	6, 7, 11,
	7, 8, 12
], "triangles did not match for density 2");
deepStrictEqual(two.uvs.map(uv => normalizeNumber(uv, 2)), [
	0, 1,
	0.25, 1,
	0.5, 1,
	0.75, 1,
	0, 0.5,
	0.25, 0.5,
	0.5, 0.5,
	0.75, 0.5,
	1, 0.5,
	0, 0,
	0.25, 0,
	0.5, 0,
	0.75, 0,
], "uvs did not match for density 2");


const three = uvSphere(3);
deepStrictEqual(three.positions.map(p => normalizeNumber(p, 2)), [
	0, -1, 0,
	0, -1, 0,
	0, -1, 0,
	0, -1, 0,
	0, -1, 0,
	0, -1, 0,
	0, -0.5, -0.87,
	0.75, -0.5, -0.43,
	0.75, -0.5, 0.43,
	0, -0.5, 0.87,
	-0.75, -0.5, 0.43,
	-0.75, -0.5, -0.43,
	0, -0.5, -0.87,
	0, 0.5, -0.87,
	0.75, 0.5, -0.43,
	0.75, 0.5, 0.43,
	0, 0.5, 0.87,
	-0.75, 0.5, 0.43,
	-0.75, 0.5, -0.43,
	0, 0.5, -0.87,
	0, 1, 0,
	0, 1, 0,
	0, 1, 0,
	0, 1, 0,
	0, 1, 0,
	0, 1, 0
], "positions did not match for density 3")
deepStrictEqual(three.triangles, [
	0, 7, 6, 
	1, 8, 7,
	2, 9, 8, 
	3, 10, 9,
	4, 11, 10, 
	5, 12, 11,
	6, 14, 13, 
	6, 7, 14,
	7, 15, 14, 
	7, 8, 15,
	8, 16, 15, 
	8, 9, 16,
	9, 17, 16,
	9, 10, 17,
	10, 18, 17,
	10, 11, 18,
	11, 19, 18,
	11, 12, 19,
	13, 14, 20, 
	14, 15, 21,
	15, 16, 22, 
	16, 17, 23,
	17, 18, 24, 
	18, 19, 25
], "triangles did not match for density 3");
deepStrictEqual(three.uvs.map(uv => normalizeNumber(uv, 2)), [
	0, 1.00, 
	0.17, 1,
	0.33, 1,
	0.50, 1,
	0.67, 1, 
	0.83, 1,
	0.00, 0.67,
	0.17, 0.67,
	0.33, 0.67,
	0.50, 0.67,
	0.67, 0.67,
	0.83, 0.67,
	1, 0.67,
	0.00, 0.33,
	0.17, 0.33, 
	0.33, 0.33,
	0.50, 0.33,
	0.67, 0.33,
	0.83, 0.33,
	1.00, 0.33,
	0.00, 0.00,
	0.17, 0.00,
	0.33, 0.00, 
	0.50, 0.00,
	0.67, 0.00, 
	0.83, 0.00
], "uvs did not match for density 3");

const facetSphereTwo = facetSphere(2);

deepStrictEqual(facetSphereTwo.positions.map(p => normalizeNumber(p, 2)), [
	0, -1, 0,
	1, 0, 0,
	0, 0, -1,

	0, -1, 0,
	0, 0, 1,
	1, 0, 0,

	0, -1, 0,
	-1, 0, 0,
	0, 0, 1,

	0, -1, 0,
	0, 0, -1,
	-1, 0, 0,
	
	0, 0, -1,
	1, 0, 0,
	0, 1, 0,

	1, 0, 0,
	0, 0, 1,
	0, 1, 0,

	0,0,1,
	-1,0,0,
	0,1,0,
	
	-1, 0, 0,
	0, 0, -1,
	0, 1, 0
], "positions did not match for density 2");
deepStrictEqual(facetSphereTwo.triangles, [
	0, 1, 2,
	3, 4, 5,
	6, 7, 8,
	9, 10, 11,
	12, 13, 14,
	15, 16, 17,
	18, 19, 20,
	21, 22, 23
], "triangles did not match for density 2");
deepStrictEqual(facetSphereTwo.uvs.map(uv => normalizeNumber(uv, 2)), [
	0, 1,
	0.25, 0.5,
	0, 0.5,

	0.25, 1,
	0.5, 0.5,
	0.25, 0.5,

	0.5, 1,
	0.75, 0.5,
	0.5, 0.5,

	0.75, 1,
	1, 0.5,
	0.75, 0.5,

	0, 0.5,
	0.25, 0.5,
	0, 0,

	0.25, 0.5,
	0.5, 0.5,
	0.25, 0,

	0.5, 0.5,
	0.75, 0.5,
	0.5, 0,

	0.75, 0.5,
	1, 0.5,
	0.75, 0
], "uvs did not match for density 2");

deepStrictEqual(facetSphereTwo.normals.map(n => normalizeNumber(n, 2)), [
	0.58, -0.58, -0.58, 
	0.58, -0.58, -0.58, 
	0.58, -0.58, -0.58, 
	0.58, -0.58, 0.58, 
	0.58, -0.58, 0.58, 
	0.58, -0.58, 0.58, 
	-0.58, -0.58, 0.58,
	-0.58, -0.58, 0.58, 
	-0.58, -0.58, 0.58, 
	-0.58, -0.58, -0.58, 
	-0.58, -0.58, -0.58, 
	-0.58, -0.58, -0.58, 
	0.58, 0.58, -0.58, 
	0.58, 0.58, -0.58, 
	0.58, 0.58, -0.58, 
	0.58, 0.58, 0.58, 
	0.58, 0.58, 0.58, 
	0.58, 0.58, 0.58, 
	-0.58, 0.58, 0.58, 
	-0.58, 0.58, 0.58, 
	-0.58, 0.58, 0.58,
	-0.58, 0.58, -0.58, 
	-0.58, 0.58, -0.58, 
	-0.58, 0.58, -0.58
]);