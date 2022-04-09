export class Environment {
	#program;
	#cubemap;

	constructor(material) {
		this.#program = material.program;
		this.#cubemap = material.cubemap;
	}

	get program() {
		return this.#program;
	}

	get cubemap() {
		return this.#cubemap;
	}
}