export class Animation {
	#meshName;
	#property;
	#from;
	#to;
	#duration;

	constructor(animation){
		this.#mesh = animation.mesh;
		this.#property = animation.property;
		this.#from = animation.from;
		this.#to = animation.to;
		this.#duration = animation.#duration;
	}

	run(ticks){
		const unitsPerTick = (this.#to - this.#from) / this.#duration;
		const ticksInAnimation =  ticks % this.#duration;
		const unitsToAnimate = unitsPerTick * ticks;
		
		switch(this.#property){
			case "rotate-y":
				mesh.setRotation({ y: })
				break;
		}
	}
}