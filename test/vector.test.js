import { deepStrictEqual } from "assert";
import { normalizeNumber } from "../js/lib/math-helpers.js";
import { triangleNormal, getPolygonCentroid3d, getPolygonCentroid2d, polyArea, getInverse, getAdjugate, getCofactorMatrix, getDeterminant } from "../js/lib/vector.js";

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

//centroids
deepStrictEqual(getPolygonCentroid2d(
	[
		[-0.5, -0.5],
		[0.5, 0.5],
		[-0.5, 0.5]
	]
).map(v => normalizeNumber(v, 2)), [-0.17, 0.17]);

deepStrictEqual(getPolygonCentroid3d(
	[
		[-0.5, -0.5, 0],
		[0.5, 0.5, 0],
		[-0.5, 0.5, 0]
	]
).map(v => normalizeNumber(v, 2)), [-0.17, 0.17, 0]);

deepStrictEqual(getPolygonCentroid3d(
	[
		[0.5, -0.5, 0],
		[1.5, 0.5, 0],
		[0.5, 0.5, 0]
	]
).map(v => normalizeNumber(v, 2)), [0.83, 0.17, 0]);

deepStrictEqual(getPolygonCentroid3d(
	[
		[-0.5, -0.5, -0.5],
		[0.5, 0.5, -0.5],
		[0.5, 0.5, 0.5],
		[-0.5, -0.5, 0.5]
	]
).map(v => normalizeNumber(v, 2)), [0, 0, 0]);

//matrix math

deepStrictEqual(getDeterminant([
	[-0.5]
]), -0.5);

deepStrictEqual(getDeterminant([
	[0.25, -0.5],
	[0, -0.5]
]), -0.125);

deepStrictEqual(getCofactorMatrix([
	[0.25, -0.5],
	[0, -0.5]
]), [
	[-0.5, -0],
	[0.5, 0.25]
]);

deepStrictEqual(getAdjugate([
	[0.25, -0.5],
	[0, -0.5]
]), [
	[-0.5, 0.5],
	[-0, 0.25]
]);

deepStrictEqual(getInverse([
	[0.25, -0.5],
	[0, -0.5]
]), [
	[4, -4],
	[0, -2]
]);