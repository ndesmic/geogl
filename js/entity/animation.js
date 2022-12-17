export class Animation {
	#target;
	#property;
	#from;
	#to;
	#duration;
	#firstTimestamp;
	#repeat;

	constructor(animation){
		this.#target = animation.target;
		this.#property = animation.property;
		this.#from = animation.from;
		this.#to = animation.to;
		this.#duration = animation.duration;
		this.#repeat = animation.repeat;
	}
	run(timestamp){
		if(!this.#firstTimestamp){
			this.#firstTimestamp = timestamp;
		}
		const elapsedTime = timestamp - this.#firstTimestamp;
		const animationRatio = this.#repeat
			? (elapsedTime % this.#duration) / this.#duration
			: Math.min(elapsedTime, this.#duration) / this.#duration
		
		const length = this.#to - this.#from;
		
		this.#target.resetTransforms();

		switch(this.#property){
			case "rotate-y": {
				this.#target.rotate({ y: this.#from + (animationRatio * length)  })
				break;
			}
		}
	}
}