export const quad = {
	positions: [
		-0.5, -0.5, 0,
		0.5, -0.5, 0,
		0.5, 0.5, 0,
		-0.5, 0.5, 0
	],
	colors: [
		0.75, 0, 0,
		0.75, 0, 0,
		0.75, 0, 0,
		0.75, 0, 0
	],
	uvs: [
		0, 1,
		1, 1,
		1, 0,
		0, 0
	],
	normals: [
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,
		0, 0, 1
	],
	triangles: [
		0, 1, 2,
		0, 2, 3
	],
	tangents: [
		1, 0, 0,
		1, 0, 0,
		1, 0, 0,
		1, 0, 0
	],
	textureName: "smile"
};

export const facetQuad = {
	positions: [
		-0.5, -0.5, 0,
		0.5, -0.5, 0,
		0.5, 0.5, 0,
		-0.5, -0.5, 0,
		0.5, 0.5, 0,
		-0.5, 0.5, 0
	],
	colors: [
		0.75, 0, 0,
		0.75, 0, 0,
		0.75, 0, 0,
		0.75, 0, 0,
		0.75, 0, 0,
		0.75, 0, 0
	],
	uvs: [
		0, 1,
		1, 1,
		1, 0,
		0, 1,
		1, 1,
		0, 0
	],
	normals: [
		0, 0, -1,
		0, 0, -1,
		0, 0, -1,
		0, 0, -1,
		0, 0, -1,
		0, 0, -1,
	],
	triangles: [
		0, 1, 2,
		3, 4, 5
	],
	centroids: [
		0, 0, 0,
		0, 0, 0,
		0, 0, 0,
		0, 0, 0,
		0, 0, 0,
		0, 0, 0
	],
	textureName: "smile"
};

export const cube = {
	positions: [
		//Front
		-0.5, -0.5, -0.5,
		0.5, -0.5, -0.5,
		0.5, 0.5, -0.5,
		-0.5, 0.5, -0.5,
		//Right
		0.5, -0.5, -0.5,
		0.5, -0.5, 0.5,
		0.5, 0.5, 0.5,
		0.5, 0.5, -0.5,
		//Back
		0.5, -0.5, 0.5,
		-0.5, -0.5, 0.5,
		-0.5, 0.5, 0.5,
		0.5, 0.5, 0.5,
		//Left
		-0.5, -0.5, 0.5,
		-0.5, -0.5, -0.5,
		-0.5, 0.5, -0.5,
		-0.5, 0.5, 0.5,
		//Top
		-0.5, 0.5, -0.5,
		0.5, 0.5, -0.5,
		0.5, 0.5, 0.5,
		-0.5, 0.5, 0.5,
		//Bottom
		-0.5, -0.5, 0.5,
		0.5, -0.5, 0.5,
		0.5, -0.5, -0.5,
		-0.5, -0.5, -0.5
	],
	colors: [
		//Front
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		//Right
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		//Back
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		//Left
		1.0, 1.0, 0.0,
		1.0, 1.0, 0.0,
		1.0, 1.0, 0.0,
		1.0, 1.0, 0.0,
		//Top
		1.0, 0.0, 1.0,
		1.0, 0.0, 1.0,
		1.0, 0.0, 1.0,
		1.0, 0.0, 1.0,
		//Bottom
		0.0, 1.0, 1.0,
		0.0, 1.0, 1.0,
		0.0, 1.0, 1.0,
		0.0, 1.0, 1.0
	],
	uvs: [
		//front
		0, 0,
		1, 0,
		1, 1,
		0, 1,
		//right
		0, 0,
		1, 0,
		1, 1,
		0, 1,
		//back
		0, 0,
		1, 0,
		1, 1,
		0, 1,
		//left
		0, 0,
		1, 0,
		1, 1,
		0, 1,
		//top
		0, 0,
		1, 0,
		1, 1,
		0, 1,
		//bottom
		0, 0,
		1, 0,
		1, 1,
		0, 1,
	],
	normals: [
		//Front
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		//Right
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		//Back
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		//Left
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		//Top
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		//Bottom
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0
	],
	tangents: [
		//front
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		//right
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		//back
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		//left
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		//top
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		//bottom
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
	],
	triangles: [
		0, 1, 2, //front
		0, 2, 3,
		4, 5, 6, //right
		4, 6, 7,
		8, 9, 10, //back
		8, 10, 11,
		12, 13, 14, //left
		12, 14, 15, 
		16, 17, 18, //top
		16, 18, 19,
		20, 21, 22, //bottom
		20, 22, 23
	],
	textureName: "grass"
};

export const quadPyramid = {
	positions: [
		//front
		0.0, 0.5, 0.0,
		-0.5, -0.5, -0.5,
		0.5, -0.5, -0.5,
		//right
		0.0, 0.5, 0.0,
		0.5, -0.5, -0.5,
		0.5, -0.5, 0.5,
		//back
		0.0, 0.5, 0.0,
		0.5, -0.5, 0.5,
		-0.5, -0.5, 0.5,
		//left
		0.0, 0.5, 0.0,
		-0.5, -0.5, 0.5,
		-0.5, -0.5, -0.5 
	],
	colors: [
		//front
		1.0, 0, 0,
		1.0, 0, 0,
		1.0, 0, 0,
		//right
		0, 1.0, 0,
		0, 1.0, 0,
		0, 1.0, 0,
		//back
		0, 0, 1.0,
		0, 0, 1.0,
		0, 0, 1.0,
		//left
		1.0, 1.0, 0,
		1.0, 1.0, 0,
		1.0, 1.0, 0,
	],
	uvs: [
		0.5, 1,
		0, 0,
		1, 0,
		0.5, 1,
		0, 0,
		1, 0,
		0.5, 1,
		0, 0,
		1, 0,
		0.5, 1,
		0, 0,
		1, 0,
	],
	triangles: [
		0, 1, 2,
		3, 4, 5,
		6, 7, 8,
		9, 10, 11
	],
	textureName: "grass"
}