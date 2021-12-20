export class Material {
	#program;
	#textures;
	#uniforms;

	constructor(material){
		this.#program = material.program;
		this.#textures = material.textures ?? [];
		this.#uniforms = material.uniforms;
	}

	get program(){
		return this.#program;
	}

	get textures(){
		return this.#textures;
	}

	get uniforms(){
		return this.#uniforms;
	}
}