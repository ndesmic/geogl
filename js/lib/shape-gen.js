import { arrayChunk } from "./array-helper.js";
import { latLngToCartesian, inverseLerp, TWO_PI, QUARTER_TURN } from "./math-helpers.js";
import { normalizeVector, polyCentroid, triangleCentroid, triangleNormal } from "./vector.js";

export function uvSphere(density, { color, uvOffset } = {}){
	const radsPerUnit = Math.PI / density;
	const sliceVertCount = density * 2;

	//positions and UVs
	const positions = [];
	let uvs = [];
	let latitude = -Math.PI / 2;
	//latitude
	for(let i = 0; i <= density; i++){
		const v = inverseLerp(-QUARTER_TURN, QUARTER_TURN, -latitude);
		let longitude = 0;
		let vertLength = sliceVertCount + ((i > 0 && i < density) ? 1 : 0); //middle rings need extra vert for end U value
		//longitude
		for (let j = 0; j < vertLength; j++) {
			positions.push(latLngToCartesian([1, latitude, longitude]));
			uvs.push([inverseLerp(0, TWO_PI, longitude), v]);
			longitude += radsPerUnit;
		}
		latitude += radsPerUnit;
	}

	if(uvOffset){
		uvs = uvs.map(uv => [(uv[0] + uvOffset[0]) % 1, (uv[1] + uvOffset[1]) % 1]);
	}

	//colors
	const colors = [];
	for(let i = 0; i < positions.length; i++){
		colors.push(color ?? [1,0,0]);
	}

	//triangles
	const triangles = [];
	let ringStartP = 0;
	for(let ring = 0; ring < density; ring++){ // start at first ring
		const vertexBump = (ring > 0 ? 1 : 0);
		for (let sliceVert = 0; sliceVert < sliceVertCount; sliceVert++){
			const thisP = ringStartP + sliceVert;
			const nextP = ringStartP + sliceVert + 1;
			const nextRingP = thisP + sliceVertCount + vertexBump;
			const nextRingNextP = nextP + sliceVertCount + vertexBump;

			if(ring === 0){
				triangles.push([thisP, nextRingNextP, nextRingP]);
			}
			if(ring === density - 1){
				triangles.push([thisP, nextP, nextRingP]);
			}
			if(ring > 0 && ring < density - 1 && density > 2){
				triangles.push([thisP, nextRingNextP, nextRingP])
				triangles.push([thisP, nextP, nextRingNextP])
			}
		}
		if(ring === 0){
			ringStartP += sliceVertCount;
		} else {
			ringStartP += sliceVertCount + 1;
		}
	}


	return {
		positions: positions.flat(),
		colors: colors.flat(),
		triangles: triangles.flat(),
		uvs: uvs.flat(),
		normals: positions.flat(),
		textureName: "earth"
	};
}

export function facetSphere(density, { color, uvOffset } = {}) {
	const radsPerUnit = Math.PI / density;
	const sliceVertCount = density * 2;

	//positions and UVs
	const rawPositions = [];
	let rawUvs = [];
	let latitude = -Math.PI / 2;
	//latitude
	for (let i = 0; i <= density; i++) {
		const v = inverseLerp(-QUARTER_TURN, QUARTER_TURN, -latitude);
		let longitude = 0;
		let vertLength = sliceVertCount + ((i > 0 && i < density) ? 1 : 0); //middle rings need extra vert for end U value
		//longitude
		for (let j = 0; j < vertLength; j++) {
			rawPositions.push(latLngToCartesian([1, latitude, longitude]));
			rawUvs.push([inverseLerp(0, TWO_PI, longitude), v]);
			longitude += radsPerUnit;
		}
		latitude += radsPerUnit;
	}

	if (uvOffset) {
		rawUvs = rawUvs.map(uv => [(uv[0] + uvOffset[0]) % 1, (uv[1] + uvOffset[1]) % 1]);
	}

	//triangles
	const triangles = [];
	const positions = [];
	const centroids = [];
	const colors = [];
	const normals = [];
	const uvs = [];
	const vertexColor = color ?? [1,0,0];
	let index = 0;
	let ringStartP = 0;

	for (let ring = 0; ring < density; ring++) {
		const vertexBump = (ring > 0 ? 1 : 0);
		for (let sliceVert = 0; sliceVert < sliceVertCount; sliceVert++) {
			const thisP = ringStartP + sliceVert;
			const nextP = ringStartP + sliceVert + 1;
			const nextRingP = thisP + sliceVertCount + vertexBump;
			const nextRingNextP = nextP + sliceVertCount + vertexBump;

			if (ring === 0) {
				positions.push(rawPositions[thisP], rawPositions[nextRingNextP], rawPositions[nextRingP]);
				uvs.push(rawUvs[thisP], rawUvs[nextRingNextP], rawUvs[nextRingP]);
				colors.push(vertexColor, vertexColor, vertexColor);
				const centroid = polyCentroid([rawPositions[thisP], rawPositions[nextRingNextP], rawPositions[nextRingP]]);
				centroids.push(centroid, centroid, centroid);
				const normal = normalizeVector(centroid);
				normals.push(normal, normal, normal);
				triangles.push([index, index + 1, index + 2]);
				index += 3;
			}
			if (ring === density - 1) {
				positions.push(rawPositions[thisP], rawPositions[nextP], rawPositions[nextRingP]);
				uvs.push(rawUvs[thisP], rawUvs[nextP], rawUvs[nextRingP]);
				colors.push(vertexColor, vertexColor, vertexColor);
				const centroid = polyCentroid([rawPositions[thisP], rawPositions[nextP], rawPositions[nextRingP]]);
				centroids.push(centroid, centroid, centroid);
				const normal = normalizeVector(centroid);
				normals.push(normal, normal, normal);
				triangles.push([index, index + 1, index + 2]);
				index += 3;
			}
			if (ring > 0 && ring < density - 1 && density > 2) {
				positions.push(
					rawPositions[thisP], rawPositions[nextRingNextP], rawPositions[nextRingP],
					rawPositions[thisP], rawPositions[nextP], rawPositions[nextRingNextP]
				);
				uvs.push(
					rawUvs[thisP], rawUvs[nextRingNextP], rawUvs[nextRingP],
					rawUvs[thisP], rawUvs[nextP], rawUvs[nextRingNextP]
				);
				colors.push(vertexColor, vertexColor, vertexColor, vertexColor, vertexColor, vertexColor);
				const centroid = polyCentroid([rawPositions[thisP], rawPositions[nextP], rawPositions[nextRingNextP], rawPositions[nextRingP]]);
				centroids.push(centroid, centroid, centroid, centroid, centroid, centroid);
				const normal = normalizeVector(centroid);
				normals.push(normal, normal, normal, normal, normal, normal);
				triangles.push([index, index + 1, index + 2], [index + 3, index + 4, index + 5]);
				index += 6;
			}
		}
		if (ring === 0) {
			ringStartP += sliceVertCount;
		} else {
			ringStartP += sliceVertCount + 1;
		}
	}


	return {
		positions: positions.flat(),
		colors: colors.flat(),
		centroids: centroids.flat(),
		triangles: triangles.flat(),
		uvs: uvs.flat(),
		normals: normals.flat(),
		textureName: "earth"
	};
}