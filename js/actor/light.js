import { invertVector } from "../lib/vector.js";

export class Light {
	#type;
	#position;
	#direction;
	#color;

	constructor(light){
		this.#type = light.type ?? "spot";
		this.#position = light.position ?? [0,0,0];
		this.#direction = light.direction;
		this.#color = light.color ?? [1,1,1,1];
	}

	getInfoMatrix(){
		return new Float32Array([
			...this.#position, 1,
			...invertVector(this.#direction), 1,
			...this.#color,
			0, 0, 0, this.#type === "spot" ? 0 : 1
		])
	}
}