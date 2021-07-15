import { Mesh } from "../actor/mesh.js";
import { cube, quadPyramid, quad, facetQuad } from "../data.js";
import { uvSphere, facetSphere } from "../lib/shape-gen.js";
import { compileShader, compileProgram, loadImage, bindAttribute } from "../lib/gl-helpers.js";
import { Camera } from "../actor/camera.js";
import { Light } from "../actor/light.js";

const degreesPerRad = 180 / Math.PI;

export class WcGeoGl extends HTMLElement {
	static observedAttributes = ["image", "height", "width"];
	#height = 720;
	#width = 1280;

	//on manipulation
	#initialPointer;
	#initialCameraPos;

	//animation
	#frameCount = 0;

	//recording
	#recording;
	#mediaRecorder;
	#recordedChunks;

	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents = element.attachEvents.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
		element.createShadowDom = element.createShadowDom.bind(element);
		element.bootGpu = element.bootGpu.bind(element);
		element.onKeyDown = element.onKeyDown.bind(element);
		element.onPointerDown = element.onPointerDown.bind(element);
		element.onPointerUp = element.onPointerUp.bind(element);
		element.onPointerMove = element.onPointerMove.bind(element);
		element.render = element.render.bind(element);

		element.toggleRecord = element.toggleRecord.bind(element);
	}
	async connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		this.attachEvents();
		await this.bootGpu();
		this.createCameras();
		this.createMeshes();
		this.createLights();
		await this.loadTextures();
		this.renderLoop();
	}
	createShadowDom() {
		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.innerHTML = `
				<style>
					:host { display: block; }
				</style>
				<canvas width="${this.#width}px" height="${this.#height}px"></canvas>
				<button id="record">Record</button>
			`;
	}
	cacheDom() {
		this.dom = {};
		this.dom.canvas = this.shadow.querySelector("canvas");
		this.dom.record = this.shadow.querySelector("#record");
	}
	attachEvents() {
		document.body.addEventListener("keydown", this.onKeyDown);
		this.dom.canvas.addEventListener("pointerdown", this.onPointerDown);
		this.dom.record.addEventListener("click", this.toggleRecord);
	}
	async bootGpu() {
		this.context = this.dom.canvas.getContext("webgl2");
		this.program = this.context.createProgram();
	
		const vertexShader = compileShader(this.context, `
				uniform mat4 uProjectionMatrix;
				uniform mat4 uModelMatrix;
				uniform mat4 uViewMatrix;

				uniform lowp mat4 uLight1;
				
				attribute vec3 aVertexPosition;
				attribute vec3 aVertexColor;
				attribute vec2 aVertexUV;
				attribute vec3 aVertexNormal;
				attribute vec3 aVertexCentroid;

				varying mediump vec4 vColor;
				varying mediump vec2 vUV;
				varying mediump vec3 vNormal;
				varying mediump vec3 vPosition;

				void main(){
					bool isPoint = uLight1[3][3] == 1.0;
					if(isPoint){
						mediump vec3 normalCentroid = vec3(uModelMatrix * vec4(aVertexCentroid, 1.0));
						mediump vec3 normalNormal = normalize(vec3(uModelMatrix * vec4(aVertexNormal, 1.0)));

						mediump vec3 toLight = normalize(uLight1[0].xyz - normalCentroid);
						mediump float light = dot(normalNormal, toLight);
						vColor = vec4(aVertexColor, 1.0) * uLight1[2] * vec4(light, light, light, 1);
					} else {
						mediump vec3 normalNormal = normalize(vec3(uModelMatrix * vec4(aVertexNormal, 1.0)));
						mediump float light = dot(normalNormal, uLight1[1].xyz);
						vColor = vec4(aVertexColor, 1.0) * uLight1[2] * vec4(light, light, light, 1);
					}

					gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
					vUV = aVertexUV;
					
					vNormal = vec3(uModelMatrix * vec4(aVertexNormal, 1.0));
					vPosition = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));
				}
			`, this.context.VERTEX_SHADER);

		const fragmentShader = compileShader(this.context, `
		    varying mediump vec4 vColor;
			varying mediump vec2 vUV;
			varying mediump vec3 vNormal;
			varying mediump vec3 vPosition;

			void main() {
				gl_FragColor = vColor;
			}
		`, this.context.FRAGMENT_SHADER);

		this.program = compileProgram(this.context, vertexShader, fragmentShader)
		this.context.enable(this.context.CULL_FACE);
		this.context.cullFace(this.context.BACK);
		this.context.useProgram(this.program);
		//this.context.enable(this.context.DEPTH_TEST);
		this.context.clearColor(0, 0.5, 0.5, 1);
	}

	async loadTextures(){
		this.textures = {
			plus: this.createTexture(await loadImage("./img/plus.png")),
			grass: this.createTexture(await loadImage("./img/grass.jpg")),
			smile: this.createTexture(await loadImage("./img/smile.png")),
			earth: this.createTexture(await loadImage("./img/earth.png")),
		};
	}

	createMeshes(){
		this.meshes = {
			//quad: new Mesh(facetQuad)
			//cube : new Mesh(cube)
			sphere : new Mesh(facetSphere(20, { uvOffset: [0.5,0], color: [0.5,0.25,1]})).setRotation({ y: Math.PI / 4})
		};
	}

	createCameras(){
		this.cameras = {
			default: new Camera({
				position: [0, 0, -2],
				screenHeight: this.#height,
				screenWidth: this.#width,
				fieldOfView: 90,
				near: 0,
				far: 5,
				isPerspective: true
			})
		}
	}

	createLights(){
		this.lights = [
			new Light({
				type: "directional",
				direction: [0,0,1],
				position: [0.5, 0, -1.5],
				color: [1,1,1,1]
			})
		]
	}

	bindMesh(mesh){
		bindAttribute(this.context, mesh.positions, "aVertexPosition", 3);
		bindAttribute(this.context, mesh.colors, "aVertexColor", 3);
		bindAttribute(this.context, mesh.uvs, "aVertexUV", 2);
		bindAttribute(this.context, mesh.normals, "aVertexNormal", 3);
		if(mesh.centroids){
			bindAttribute(this.context, mesh.centroids, "aVertexCentroid", 3);
		}
		this.bindIndices(mesh.triangles);
		this.bindUniforms(mesh.getModelMatrix());
		this.bindTexture(mesh.textureName);
	}

	bindIndices(indices) {
		const indexBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);
		this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, indices, this.context.STATIC_DRAW);
	}
	bindUniforms(modelMatrix){
		const modelMatrixLocation = this.context.getUniformLocation(this.program, "uModelMatrix");
		this.context.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
	}
	bindTexture(name){
		if(name){
			this.context.bindTexture(this.context.TEXTURE_2D, this.textures[name]);
		}
	}
	setupGlobalUniforms(){
		const projectionMatrix = this.cameras.default.getProjectionMatrix();
		const projectionLocation = this.context.getUniformLocation(this.program, "uProjectionMatrix");
		this.context.uniformMatrix4fv(projectionLocation, false, projectionMatrix);

		const viewMatrix = this.cameras.default.getViewMatrix();
		const viewLocation = this.context.getUniformLocation(this.program, "uViewMatrix");
		this.context.uniformMatrix4fv(viewLocation, false, viewMatrix);

		const light1Matrix = this.lights[0].getInfoMatrix();
		const light1Location = this.context.getUniformLocation(this.program, "uLight1");
		this.context.uniformMatrix4fv(light1Location, false, light1Matrix);
	}
	createTexture(image) {
		const texture = this.context.createTexture();
		this.context.bindTexture(this.context.TEXTURE_2D, texture);
		this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, image);
		this.context.generateMipmap(this.context.TEXTURE_2D);

		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR_MIPMAP_LINEAR);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);

		return texture;
	}
	renderLoop(){
		requestAnimationFrame(() => {
			this.render();
			this.renderLoop();
		});
	}
	render() {
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
		this.setupGlobalUniforms();

		for (const mesh of Object.values(this.meshes)){
			this.bindMesh(mesh);
			this.context.drawElements(this.context.TRIANGLES, mesh.triangles.length, this.context.UNSIGNED_SHORT, 0);
		}
	}

	//Events
	onKeyDown(e){
		switch(e.code){
			case "KeyA": {
				this.cameras.default.panBy({ x: 0.1 });
				break;
			}
			case "KeyD": {
				this.cameras.default.panBy({ x: -0.1 });
				break;
			}
			case "KeyW": {
				this.cameras.default.panBy({ z: 0.1 });
				break;
			}
			case "KeyS": {
				this.cameras.default.panBy({ z: -0.1 });
				break;
			}
		}
	}

	onPointerDown(e){
		this.#initialPointer = [e.offsetX, e.offsetY];
		this.#initialCameraPos = this.cameras.default.getPosition();
		this.dom.canvas.setPointerCapture(e.pointerId);
		this.dom.canvas.addEventListener("pointermove", this.onPointerMove);
		this.dom.canvas.addEventListener("pointerup", this.onPointerUp);
	}

	onPointerUp(e){
		this.dom.canvas.removeEventListener("pointermove", this.onPointerMove);
		this.dom.canvas.removeEventListener("pointerup", this.onPointerUp);
		this.dom.canvas.releasePointerCapture(e.pointerId);
	}

	onPointerMove(e){
		const pointerDelta = [
			e.offsetX - this.#initialPointer[0],
			e.offsetY - this.#initialPointer[1]
		];

		const radsPerWidth = (180 / degreesPerRad) / this.#width;
		const xRads = pointerDelta[0] * radsPerWidth;
		const yRads = pointerDelta[1] * radsPerWidth * (this.#height / this.#width);

		this.cameras.default.setPosition(this.#initialCameraPos);
		this.cameras.default.orbitBy({ long: xRads, lat: yRads });
	}

	toggleRecord(e){
		this.#recording = !this.#recording;

		if(this.#recording){
			this.dom.record.textContent = "Stop";
			const stream = this.dom.canvas.captureStream(25);
			this.#mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'video/webm;codecs=vp9'
			});
			this.#recordedChunks = [];
			this.#mediaRecorder.ondataavailable = e => {
				if(e.data.size > 0){
					this.#recordedChunks.push(e.data);
				}
			};
			this.#mediaRecorder.start();
		} else {
			this.dom.record.textContent = "Record"
			this.#mediaRecorder.stop();
			setTimeout(() => {
				const blob = new Blob(this.#recordedChunks, {
					type: "video/webm"
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "recording.webm";
				a.click();
				URL.revokeObjectURL(url);
			},0);
		}
	}

	//Attrs
	attributeChangedCallback(name, oldValue, newValue) {
		if (newValue !== oldValue) {
			this[name] = newValue;
		}
	}
	set height(value) {
		this.#height = value;
		if (this.dom) {
			this.dom.canvas.height = value;
		}
	}
	set width(value) {
		this.#width = value;
		if (this.dom) {
			this.dom.canvas.height = value;
		}
	}
	//TODO: throw away program on detach
}

customElements.define("wc-geo-gl", WcGeoGl);
