import { getOrthoMatrix, getProjectionMatrix, getLookAtMatrix, UP, subtractVector } from "./vector.js";
import { cartesianToLatLng, latLngToCartesian } from "./trig.js";

export class Camera {
	#position = [0,0,-1];
	#target = [0,0,0];
	#screenWidth;
	#screenHeight;
	#near;
	#far;
	#left;
	#right;
	#top;
	#bottom;
	#fieldOfView;
	#isPerspective;

	constructor(camera){
		this.#position = camera.position;
		this.#screenWidth = camera.screenWidth;
		this.#screenHeight = camera.screenHeight;
		this.#left = camera.left;
		this.#right = camera.right;
		this.#top = camera.top;
		this.#bottom = camera.bottom;
		this.#near = camera.near;
		this.#far = camera.far;
		this.#fieldOfView = camera.fieldOfView;
		this.#isPerspective = camera.isPerspective;

		if (this.#isPerspective && (this.#screenWidth === undefined || this.#screenHeight === undefined || this.#near === undefined || this.#far === undefined || this.#fieldOfView === undefined)){
			throw new Error(`Missing required value for perspective projection`);
		}
		if (!this.#isPerspective && (this.#left === undefined || this.#right === undefined || this.#near === undefined || this.#far === undefined || this.#top === undefined || this.#bottom === undefined)) {
			throw new Error(`Missing required value for ortho projection`);
		}
	}

	moveTo(x, y, z){
		this.#position = [x,y,z];
	}

	moveBy({ x = 0, y = 0, z = 0 }){
		this.#position[0] += x; 
		this.#position[1] += y;
		this.#position[2] += z;
	}

	panBy({ x = 0, y = 0, z = 0 }){
		this.#position[0] += x;
		this.#target[0] += x;
		this.#position[1] += y;
		this.#target[1] += y;
		this.#position[2] += z;
		this.#target[2] += z;
	}

	orbitBy({ lat = 0, long = 0 }){
		const [r, currentLat, currentLng] = this.getOrbit(); 
		this.#position = latLngToCartesian([r, currentLat + lat, currentLng - long]);
	}

	lookAt(x, y, z){
		this.#target = [x,y,z];
	}

	getOrbit(){
		const targetDelta = subtractVector(this.#position, this.#target);
		return cartesianToLatLng(targetDelta);
	}

	getViewMatrix(){
		return getLookAtMatrix(this.#position, this.#target, UP).flat();
	}

	getProjectionMatrix(){
		return this.#isPerspective 
			? new Float32Array(getProjectionMatrix(this.#screenHeight, this.#screenWidth, this.#fieldOfView, this.#near, this.#far).flat())
			: new Float32Array(getOrthoMatrix(this.#left, this.#right, this.#bottom, this.#top, this.#near, this.#far).flat());
	}

	getFieldOfView(){
		return this.#fieldOfView;
	}

	getPosition(){
		return this.#position;
	}

	setPosition(position){
		this.#position = position;
	}
}