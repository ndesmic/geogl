import { invertVector } from "../lib/vector.js";

export class Light {
	#type;
	#position;
	#direction;
	#color;

	constructor(light){
		this.#type = light.type ?? "directional";
		this.#position = light.position ?? [0,0,0];
		this.#direction = light.direction;
		this.#color = light.color ?? [1,1,1,1];
	}

	/*
	px, py, pz, 1,   position
	dx, dy, dz, 1,   direction (to light)
	r, g, b, a,      color
	0, 0, 0, type    type(0 = spot, 1 = point)
	*/
	getInfoMatrix(){
		return new Float32Array([
			...this.#position, 1,
			...invertVector(this.#direction), 1,
			...this.#color,
			0, 0, 0, this.#type === "directional" ? 0 : 1
		])
	}
}