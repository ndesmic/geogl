import { multiplyMatrix, getIdentityMatrix, getTranslationMatrix, getScaleMatrix, getRotationXMatrix, getRotationYMatrix, getRotationZMatrix, transpose } from "../lib/vector.js";

export class Mesh {
	#positions;
	#colors;
	#normals;
	#uvs;
	#centroids;
	#triangles;
	#material;

	#modelMatrix = getIdentityMatrix();

	constructor(mesh) {
		this.positions = mesh.positions;
		this.colors = mesh.colors;
		this.normals = mesh.normals;
		this.uvs = mesh.uvs;
		this.centroids = mesh.centroids;
		this.triangles = mesh.triangles;
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
	setTranslation({ x = 0, y = 0, z = 0 }) {
		this.#modelMatrix = multiplyMatrix(getTranslationMatrix(x, y, z), this.#modelMatrix);
		return this;
	}
	setScale({ x = 1, y = 1, z = 1 }) {
		this.#modelMatrix = multiplyMatrix(getScaleMatrix(x, y, z), this.#modelMatrix);
		return this;
	}
	setRotation({ x, y, z }) {
		if (x) {
			this.#modelMatrix = multiplyMatrix(getRotationXMatrix(x), this.#modelMatrix);
		}
		if (y) {
			this.#modelMatrix = multiplyMatrix(getRotationYMatrix(y), this.#modelMatrix);
		}
		if (z) {
			this.#modelMatrix = multiplyMatrix(getRotationZMatrix(z), this.#modelMatrix);
		}
		return this;
	}
	resetTransforms() {
		this.#modelMatrix = getIdentityMatrix();
	}
	getModelMatrix() {
		return transpose(this.#modelMatrix).flat();
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