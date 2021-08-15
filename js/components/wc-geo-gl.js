import { Mesh } from "../entity/mesh.js";
import { cube, quadPyramid, quad, facetQuad } from "../data.js";
import { uvSphere, facetSphere, terrianMesh } from "../lib/shape-gen.js";
import { loadImage, bindAttribute, loadProgram, loadTexture } from "../lib/gl-helpers.js";
import { Camera } from "../entity/camera.js";
import { Light } from "../entity/light.js";
import { Material } from "../entity/material.js";

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
		element.onWheel = element.onWheel.bind(element);
		element.render = element.render.bind(element);

		element.toggleRecord = element.toggleRecord.bind(element);
	}
	async connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		this.attachEvents();
		await this.bootGpu();
		await this.createMaterials();
		this.createCameras();
		this.createMeshes();
		this.createLights();
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
		this.dom.canvas.addEventListener("wheel", this.onWheel);
	}
	async bootGpu() {
		this.context = this.dom.canvas.getContext("webgl2");
		this.context.enable(this.context.CULL_FACE);
		this.context.cullFace(this.context.BACK);
		//this.context.enable(this.context.DEPTH_TEST);
		this.context.clearColor(0, 0.5, 0.5, 1);
	}

	createMeshes(){
		this.meshes = {
			/*
			sphere : new Mesh({
				...uvSphere(10, { uvOffset: [0.5,0], color: [0.5,0.25,1]}),
				material: this.materials.vertexShaded
			})*/
			
			mesh: new Mesh({
				...terrianMesh(4, 4),
				material: this.materials.pixelShaded
			}).setRotation({ x: -Math.PI / 2 })
		};
	}

	createCameras(){
		this.cameras = {
			default: new Camera({
				position: [0, 0, -0.2],
				screenHeight: this.#height,
				screenWidth: this.#width,
				fieldOfView: 90,
				near: 0,
				far: 5,
				isPerspective: true
			})
		};
	}

	createLights(){
		this.lights = [
			new Light({
				type: "point",
				direction: [0,0,1],
				position: [0.5, 0, -1],
				color: [1,1,1,1]
			})
		];
	}

	async createMaterials(){
		this.materials = {
			flatShaded: new Material({
				program: await loadProgram(this.context, "shaders/flat-shaded")
			}),
			vertexShaded: new Material({
				program: await loadProgram(this.context, "shaders/vertex-shaded")
			}),
			pixelShaded: new Material({
				program: await loadProgram(this.context, "shaders/pixel-shaded")
			}),
			grassTextured: new Material({
				program: await loadProgram(this.context, "shaders/textured"),
				textures: [await loadTexture(this.context, "./img/grass.jpg")]
			})
		};
	}

	bindMesh(mesh){
		this.bindMaterial(mesh.material);
		bindAttribute(this.context, mesh.positions, "aVertexPosition", 3);
		bindAttribute(this.context, mesh.colors, "aVertexColor", 3);
		bindAttribute(this.context, mesh.uvs, "aVertexUV", 2);
		bindAttribute(this.context, mesh.normals, "aVertexNormal", 3);
		if(mesh.centroids){
			bindAttribute(this.context, mesh.centroids, "aVertexCentroid", 3);
		}
		this.bindIndices(mesh.triangles);
		this.bindUniforms(mesh.getModelMatrix());
		
	}

	bindIndices(indices) {
		const indexBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);
		this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, indices, this.context.STATIC_DRAW);
	}
	bindUniforms(modelMatrix){
		const program = this.context.getParameter(this.context.CURRENT_PROGRAM)
		const modelMatrixLocation = this.context.getUniformLocation(program, "uModelMatrix");
		this.context.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
	}
	bindMaterial(material){
		this.context.useProgram(material.program);
		material.textures.forEach(tex => {
			this.context.bindTexture(this.context.TEXTURE_2D, tex);
		});
	}
	setupGlobalUniforms(){
		const program = this.context.getParameter(this.context.CURRENT_PROGRAM);
		const projectionMatrix = this.cameras.default.getProjectionMatrix();
		const projectionLocation = this.context.getUniformLocation(program, "uProjectionMatrix");
		this.context.uniformMatrix4fv(projectionLocation, false, projectionMatrix);

		const viewMatrix = this.cameras.default.getViewMatrix();
		const viewLocation = this.context.getUniformLocation(program, "uViewMatrix");
		this.context.uniformMatrix4fv(viewLocation, false, viewMatrix);

		const light1Matrix = this.lights[0].getInfoMatrix();
		const light1Location = this.context.getUniformLocation(program, "uLight1");
		this.context.uniformMatrix4fv(light1Location, false, light1Matrix);
	}
	renderLoop(){
		requestAnimationFrame(() => {
			this.render();
			this.renderLoop();
		});
	}
	render() {
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);

		for (const mesh of Object.values(this.meshes)){
			this.bindMesh(mesh);
			this.setupGlobalUniforms();
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
			case "NumpadAdd": {
				this.cameras.default.zoomBy(2);
				break;
			}
			case "NumpadSubtract": {
				this.cameras.default.zoomBy(0.5);
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

	onWheel(e) {
		const delta = e.deltaY / 1000;
		this.cameras.default.orbitBy({ radius: delta });
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
