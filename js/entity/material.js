export class Material {
	#program;
	#textures;

	constructor(material){
		this.#program = material.program;
		this.#textures = material.textures ?? [];
	}

	get program(){
		return this.#program;
	}

	get textures(){
		return this.#textures;
	}
}