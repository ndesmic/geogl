let index = 0;

export class Material {
	#program;
	#textures;
	#uniforms;
	#name;

	constructor(material){
		this.#program = material.program;
		this.#textures = material.textures ?? [];
		this.#uniforms = material.uniforms;
		this.#name = material.name ?? `material-${index++}`;
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

	get name(){
		return this.#name;
	}
}