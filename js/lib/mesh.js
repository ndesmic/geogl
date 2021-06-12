import { multiplyMatrix, getIdentityMatrix, getTranslationMatrix, getScaleMatrix, getRotationXMatrix, getRotationYMatrix, getRotationZMatrix, transpose } from "./vector.js";

export class Mesh {
	#positions;
	#colors;
	#normals;
	#uvs;
	#triangles;

	#textureName;

	#translation = [0, 0, 0];
	#scale = [1, 1, 1];
	#rotation = [0, 0, 0];

	constructor(mesh){
		this.positions = mesh.positions;
		this.colors = mesh.colors;
		this.normals = mesh.normals;
		this.uvs = mesh.uvs;
		this.triangles = mesh.triangles;
		this.textureName = mesh.textureName;
	}

	set positions(val){
		this.#positions = new Float32Array(val);
	}
	get positions(){
		return this.#positions;
	}
	set colors(val) {
		this.#colors = new Float32Array(val);
	}
	get colors(){
		return this.#colors;
	}
	set normals(val) {
		this.#normals = new Float32Array(val);
	}
	get normals(){
		return this.#normals;
	}
	set uvs(val) {
		this.#uvs = new Float32Array(val);
	}
	get uvs(){
		return this.#uvs;
	}
	get textureName(){
		return this.#textureName;
	}
	set textureName(val){
		this.#textureName = val;
	}
	set triangles(val) {
		this.#triangles = new Uint16Array(val);
	}
	get triangles(){
		return this.#triangles;
	}
	setTranslation({ x, y, z }){
		if (x){
			this.#translation[0] = x;
		}
		if (y) {
			this.#translation[1] = y;
		}
		if (z) {
			this.#translation[2] = z;
		}
	}
	getTranslation(){
		return this.#translation;
	}
	setScale({ x, y, z }) {
		if (x) {
			this.#scale[0] = x;
		}
		if (y) {
			this.#scale[1] = y;
		}
		if (z) {
			this.#scale[2] = z;
		}
	}
	getScale() {
		return this.#scale;
	}
	setRotation({ x, y, z }) {
		if (x) {
			this.#rotation[0] = x;
		}
		if (y) {
			this.#rotation[1] = y;
		}
		if (z) {
			this.#rotation[2] = z;
		}
	}
	getRotation(){
		return this.#rotation;
	}
	getModelMatrix(){
		return new Float32Array(transpose(multiplyMatrix(
			getTranslationMatrix(this.#translation[0], this.#translation[1], this.#translation[2]),
				multiplyMatrix(
					getRotationXMatrix(this.#rotation[0]),
					multiplyMatrix(
						getRotationYMatrix(this.#rotation[1]),
						multiplyMatrix(
							getRotationZMatrix(this.#rotation[2]),
							multiplyMatrix(
								getScaleMatrix(this.#scale[0], this.#scale[1], this.#scale[2]),
								getIdentityMatrix()
							)
						)
					)
				)
			)).flat());
	}
}