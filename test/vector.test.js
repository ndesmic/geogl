import { deepStrictEqual } from "assert";
import { normalizeNumber } from "../js/lib/math-helpers.js";
import { triangleNormal } from "../js/lib/vector.js";

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