import { multiplyMatrix, getIdentityMatrix, getTranslationMatrix, getScaleMatrix, getRotationXMatrix, getRotationYMatrix, getRotationZMatrix, transpose } from "./vector.js";

export class Mesh {
	#positions;
	#colors;
	#normals;
	#uvs;
	#triangles;

	#textureName;

	#modelMatrix = getIdentityMatrix();

	constructor(mesh) {
		this.positions = mesh.positions;
		this.colors = mesh.colors;
		this.normals = mesh.normals;
		this.uvs = mesh.uvs;
		this.triangles = mesh.triangles;
		this.textureName = mesh.textureName;
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
	get textureName() {
		return this.#textureName;
	}
	set textureName(val) {
		this.#textureName = val;
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
}