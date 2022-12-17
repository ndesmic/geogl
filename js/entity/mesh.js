import { multiplyMatrix, getIdentityMatrix, getTranslationMatrix, getScaleMatrix, getRotationXMatrix, getRotationYMatrix, getRotationZMatrix, transpose } from "../lib/vector.js";

export class Mesh {
	#positions;
	#colors;
	#normals;
	#uvs;
	#centroids;
	#triangles;
	#tangents;
	#material;
	#transforms = [];

	constructor(mesh) {
		this.positions = mesh.positions;
		this.colors = mesh.colors;
		this.normals = mesh.normals;
		this.uvs = mesh.uvs;
		this.centroids = mesh.centroids;
		this.triangles = mesh.triangles;
		this.tangents = mesh.tangents;
		this.material = mesh.material;
	}

	set positions(val) {
		this.#positions = new Float32Array(val);
	}
	get positions() {
		return this.#positions;
	}
	set colors(val) {
		this.#colors = new Float32Array(val);
	}
	get colors() {
		return this.#colors;
	}
	set normals(val) {
		this.#normals = new Float32Array(val);
	}
	get normals() {
		return this.#normals;
	}
	set uvs(val) {
		this.#uvs = new Float32Array(val);
	}
	get uvs() {
		return this.#uvs;
	}
	set centroids(val){
		this.#centroids = new Float32Array(val);
	}
	get centroids(){
		return this.#centroids;
	}
	set tangents(val){
		this.#tangents = val;
	}
	get tangents(){
		return this.#tangents;
	}
	get material() {
		return this.#material;
	}
	set material(val) {
		this.#material = val;
	}
	set triangles(val) {
		this.#triangles = new Uint16Array(val);
	}
	get triangles() {
		return this.#triangles;
	}
	translate({ x = 0, y = 0, z = 0 }) {
		this.#transforms.push(getTranslationMatrix(x, y ,z));
		return this;
	}
	scale({ x = 1, y = 1, z = 1 }) {
		this.#transforms.push(getScaleMatrix(x, y, z));
		return this;
	}
	rotate({ x, y, z }) {
		//there's an order dependency here... something something quaterions...
		if (x) {
			this.#transforms.push(getRotationXMatrix(x));
		}
		if (y) {
			this.#transforms.push(getRotationYMatrix(y));
		}
		if (z) {
			this.#transforms.push(getRotationZMatrix(z));
		}
		return this;
	}
	resetTransforms() {
		this.#transforms = [];
	}
	getModelMatrix() {
		const modelMatrix = this.#transforms.reduce((mm, tm) => multiplyMatrix(tm, mm), getIdentityMatrix());
		return transpose(modelMatrix).flat();
	}
	normalizePositions(){
		let max = -Infinity;

		for(let i = 0; i < this.#positions.length; i += 3){
			const x = this.#positions[i];
			const y = this.#positions[i + 1];
			const z = this.#positions[i + 2];

			if(x > max){
				max = x;
			}
			if (y > max) {
				max = y;
			}
			if (z > max) {
				max = z;
			}
		}

		for(let i = 0; i < this.#positions.length; i++){
			this.#positions[i] /= max;
		}

		return this;
	}
}