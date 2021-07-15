import { deepStrictEqual } from "assert";
import { normalizeNumber } from "../js/lib/math-helpers.js";
import { triangleNormal, triangleCentroid, polyCentroid, polyCentroid2d, polyArea } from "../js/lib/vector.js";

//triangle normal
deepStrictEqual(triangleNormal(
	[0,0,0],
	[0,1,0],
	[1,0,0],
).map(v => normalizeNumber(v,2)), [0,0,1], "gets triangle normal");
deepStrictEqual(triangleNormal(
	[0, -1, 0],
	[1, 0, 0],
	[0, 0, -1],
).map(v => normalizeNumber(v,2)), [0.58, -0.58, -0.58], "gets triangle normal");

//triangle centroid
deepStrictEqual(triangleCentroid(
	[-0.5, -0.5, 0],
	[0.5, 0.5, 0],
	[-0.5, 0.5, 0]
).map(v => normalizeNumber(v,2)), [-0.17,0.17,0]);

// Poly Area
deepStrictEqual(polyArea(
	[
		[2,1],
		[4,5],
		[7,8]
	]
), 3);
deepStrictEqual(polyArea(
	[
		[3, 4],
		[5, 11],
		[12, 8],
		[9,5],
		[5,6]
	]
), 30);

//centroid
deepStrictEqual(polyCentroid2d(
	[
		[-0.5, -0.5],
		[0.5, 0.5],
		[-0.5, 0.5]
	]
).map(v => normalizeNumber(v, 2)), [-0.17, 0.17]);

deepStrictEqual(polyCentroid(
	[
		[-0.5, -0.5, 0],
		[0.5, 0.5, 0],
		[-0.5, 0.5, 0]
	]
).map(v => normalizeNumber(v, 2)), [-0.17, 0.17, 0]);

deepStrictEqual(polyCentroid(
	[
		[0.5, -0.5, 0],
		[1.5, 0.5, 0],
		[0.5, 0.5, 0]
	]
).map(v => normalizeNumber(v, 2)), [0.83, 0.17, 0]);

deepStrictEqual(polyCentroid(
	[
		[-0.5, -0.5, -0.5],
		[0.5, 0.5, -0.5],
		[0.5, 0.5, 0.5],
		[-0.5, -0.5, 0.5]
	]
).map(v => normalizeNumber(v, 2)), [0, 0, 0]);