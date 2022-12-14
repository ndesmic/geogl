import { Mesh } from "../entity/mesh.js";
import { cube, quadPyramid, quad, facetQuad } from "../data.js";
import { uvSphere, facetSphere, terrianMesh } from "../lib/shape-gen.js";
import { loadObj } from "../lib/obj-loader.js";
import { loadImage, loadUrl, bindAttribute, loadProgram, loadTexture, loadCubeMap, autoBindUniform, createTexture } from "../lib/gl-helpers.js";
import { getInverse, multiplyMatrix, trimMatrix, transpose, asMatrix, multiplyMatrixVector } from "../lib/vector.js";
import { Camera } from "../entity/camera.js";
import { Light } from "../entity/light.js";
import { Material } from "../entity/material.js";
import { Environment } from "../entity/environment.js";
import { downloadBlob, downloadUrl } from "../lib/utilities.js";

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
	#shouldCapture;
	#mediaRecorder;
	#recordedChunks;
	#isBackfaceCulled;

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
		element.onBackfaceChange = element.onBackfaceChange.bind(element);
		element.render = element.render.bind(element);

		element.toggleRecord = element.toggleRecord.bind(element);
		element.captureScreen = element.captureScreen.bind(element);
	}
	async connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		this.attachEvents();
		await this.bootGpu();
		await this.createMaterials();
		await this.createEnvironment();
		this.createCameras();
		await this.createMeshes();
		this.createLights();
		this.renderLoop();
	}
	createShadowDom() {
		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.innerHTML = `
				<style>
					:host { display: block; flex-flow: column nowrap; }
					canvas { display: block; }
				</style>
				<canvas width="${this.#width}" height="${this.#height}"></canvas>
				<div class="row">
					<button id="capture-screenshot">Screenshot</button>
					<button id="capture-video">Record Video</button>
				</div>
				<div class="row">
					<label>Backface culling:<input type="checkbox" id="chk-backface" checked></label>
				</div>
			`;
	}
	cacheDom() {
		this.dom = {};
		this.dom.canvas = this.shadow.querySelector("canvas");
		this.dom.captureVideo = this.shadow.querySelector("#capture-video");
		this.dom.captureScreen = this.shadow.querySelector("#capture-screenshot");
		this.dom.chkBackface = this.shadow.querySelector("#chk-backface");
	}
	attachEvents() {
		document.body.addEventListener("keydown", this.onKeyDown);
		this.dom.chkBackface.addEventListener("change", this.onBackfaceChange);
		this.dom.canvas.addEventListener("pointerdown", this.onPointerDown);
		this.dom.captureVideo.addEventListener("click", this.toggleRecord);
		this.dom.captureScreen.addEventListener("click", this.captureScreen);
		this.dom.canvas.addEventListener("wheel", this.onWheel);
	}
	async bootGpu() {
		this.context = this.dom.canvas.getContext("webgl2");
		this.context.clearColor(0, 0.5, 0.0, 1);
		//this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, true);
	}

	//create content

	async createMeshes(){
		this.meshes = {
			/*
			teapot: new Mesh({
				...loadObj(await loadUrl("./meshes/teapot-normal.obj"), {
					color: [1, 0, 0],
				}),
				material: this.materials.pixelShaded
			})
			.normalizePositions()
			//.setTranslation({ y: -0.5 })
			/*sphere : new Mesh({
				...uvSphere(20, { color: [1,0,0], uvScale: [4.0, 4.0]} ),
				material: this.materials.orange
			})
			mesh: new Mesh({
				...terrianMesh(4, 4),
				material: this.materials.bumpMapped
			}).setRotation({ y: 90,  })

			*/
			quad: new Mesh({
				...quad,
				material: this.materials.bumpMapped
			}).setRotation({ y : Math.PI / 4 })
		};
	}

	createCameras(){
		this.cameras = {
			default: new Camera({
				position: [0, 0, 2],
				screenHeight: this.#height,
				screenWidth: this.#width,
				fieldOfView: 90,
				near: 0.01,
				far: 5,
				isPerspective: true
			})
		};
	}

	createLights(){
		this.lights = [
			new Light({
				type: "point",
				position: [0.0, 0, 2],
				color: [1,1,1,1]
			})
		];
	}

	async createMaterials(){
		this.materials = {
			/*
			flatShaded: new Material({
				program: await loadProgram(this.context, "shaders/flat-shaded")
			}),
			vertexShaded: new Material({
				program: await loadProgram(this.context, "shaders/vertex-shaded")
			}),
			colored: new Material({
				program: await loadProgram(this.context, "shaders/colored"),
				name: "colored"
			}),
			pixelShaded: new Material({
				program: await loadProgram(this.context, "shaders/pixel-shaded"),
				name: "pixel-shaded"
			}),
			pixelShadedSpecular: new Material({
				program: await loadProgram(this.context, "shaders/pixel-shaded-blinn-phong"),
				uniforms: {
					gloss: 100.0
				}
			}),
			specMapped: new Material({
				program: await loadProgram(this.context, "shaders/spec-mapped"),
				textures: [
					await loadTexture(this.context, "./img/slimewall.png"),
					await loadTexture(this.context, "./img/slimewall.specmap.png")
				],
				uniforms: {
					gloss: 100.0
				}
			}),
			glossMapped: new Material({
				program: await loadProgram(this.context, "shaders/gloss-mapped"),
				textures: [
					await loadTexture(this.context, "./img/gradient.png")
				],
				uniforms: {
					specularity: 0.5
				}
			}),
			grassTextured: new Material({
				program: await loadProgram(this.context, "shaders/textured"),
				textures: [await loadTexture(this.context, "./img/grass.jpg")]
			})
			earth: new Material({
				program: await loadProgram(this.context, "shaders/textured"),
				textures: [await loadTexture(this.context, "./img/earth.png")]
			}),
			orange: new Material({
				program: await loadProgram(this.context, "shaders/textured"),
				textures: [await loadTexture(this.context, "./img/orange.jpg", { wrapS: this.context.REPEAT, wrapT: this.context.REPEAT })],
				name: "orange"
			}),	
						*/
			bumpMapped: new Material({
				program: await loadProgram(this.context, "shaders/bump-mapped"),
				textures: [await loadTexture(this.context, "./img/bumpmap/bump-map.png", { wrapS: this.context.REPEAT, wrapT: this.context.REPEAT })],
				uniforms: {
					scale: 1.0
				},
				name: "bump-mapped"
			})
		};
	}

	async createEnvironment() {
		/*
		this.environment = new Environment({
			program: await loadProgram(this.context, "shaders/environment-map"),
			cubemap: await loadCubeMap(this.context, [
				"./img/cubemap/tree-minus-x.png",
				"./img/cubemap/tree-plus-y.png",
				"./img/cubemap/tree-plus-z.png",
				"./img/cubemap/tree-minus-y.png",
				"./img/cubemap/tree-plus-x.png",
				"./img/cubemap/tree-minus-z.png",
			])
		});
		*/
	}

	//END create content

	bindMesh(mesh){
		this.bindMaterial(mesh.material);
		bindAttribute(this.context, mesh.positions, "aVertexPosition", 3);
		bindAttribute(this.context, mesh.colors, "aVertexColor", 3);
		bindAttribute(this.context, mesh.uvs, "aVertexUV", 2);
		bindAttribute(this.context, mesh.normals, "aVertexNormal", 3);
		bindAttribute(this.context, mesh.tangents, "aVertexTangent", 3);
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

		const viewMatrix = this.cameras.default.getViewMatrix();
		const normalMatrixLocation = this.context.getUniformLocation(program, "uNormalMatrix");
		const viewModelInverseTranspose = transpose(getInverse(trimMatrix(multiplyMatrix(asMatrix(modelMatrix, 4, 4), asMatrix(viewMatrix, 4, 4)), 3, 3)));
		this.context.uniformMatrix3fv(normalMatrixLocation, false, viewModelInverseTranspose.flat());
	}
	bindMaterial(material){
		this.context.useProgram(material.program);
		material.textures.forEach((tex, index) => {
			const location = this.context.getUniformLocation(material.program, `uSampler${index}`);
			if(!location) return;
			this.context.uniform1i(location, index);
			this.context.activeTexture(this.context[`TEXTURE${index}`]);
			this.context.bindTexture(this.context.TEXTURE_2D, tex);
		});
		if(material.uniforms){
			Object.entries(material.uniforms).forEach(([uniformName, uniformValue]) => {
				autoBindUniform(this.context, uniformName, uniformValue, material.program);
			});
		}
	}
	bindEnvironment(){
		if(this.environment){
			this.context.useProgram(this.environment.program);
			this.context.activeTexture(this.context.TEXTURE0);
			this.context.bindTexture(this.context.TEXTURE_CUBE_MAP, this.environment.cubemap);
			bindAttribute(this.context, [
				-1.0, -1.0,
				1.0, -1.0,
				-1.0, 1.0,
				1.0, 1.0
			], "aVertexPosition", 2);
			const viewMatrix = asMatrix(this.cameras.default.getViewMatrix(), 4, 4);
			//remove translation
			viewMatrix[3][0] = 0;
			viewMatrix[3][1] = 0;
			viewMatrix[3][2] = 0;
			const projectionMatrix = asMatrix(this.cameras.default.getProjectionMatrix(), 4, 4);
			const viewProjectMatrix = multiplyMatrix(viewMatrix, projectionMatrix);
			const inverseViewProjectionMatrix = getInverse(viewProjectMatrix);

			autoBindUniform(this.context, "uViewProjectionInverse", inverseViewProjectionMatrix.flat());
			bindAttribute(this.context, [
				-1.0, -1.0,
				3, -1.0,
				-1.0, 3.0
			], "aVertexPosition", 2);
		}
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

		const cameraPosition = this.cameras.default.getPosition();
		const cameraPositionLocation = this.context.getUniformLocation(program, "uCameraPosition");
		this.context.uniform3fv(cameraPositionLocation, Float32Array.from(cameraPosition));
	}
	renderLoop(){
		requestAnimationFrame(() => {
			this.render();
			this.renderLoop();
		});
	}
	render() {
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);

		if(this.#isBackfaceCulled){
			this.context.enable(this.context.CULL_FACE);
			this.context.cullFace(this.context.BACK);
		} else {
			this.context.disable(this.context.CULL_FACE);
		}

		this.context.enable(this.context.DEPTH_TEST);
		this.context.depthMask(true);

		for (const mesh of Object.values(this.meshes)){
			this.bindMesh(mesh);
			this.setupGlobalUniforms();
			this.context.drawElements(this.context.TRIANGLES, mesh.triangles.length, this.context.UNSIGNED_SHORT, 0);
		}

		this.context.depthMask(false);

		if (this.environment) {
			this.context.useProgram(this.environment.program);
			this.bindEnvironment();
			this.setupGlobalUniforms();
			this.context.drawArrays(this.context.TRIANGLES, 0, 3);
		}

		if(this.#shouldCapture){
			this.#shouldCapture = false;
			downloadUrl(this.dom.canvas.toDataURL(), "capture.png");
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
			this.dom.captureVideo.textContent = "Stop Recording";
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
			this.dom.captureVideo.textContent = "Record Video";
			this.#mediaRecorder.stop();
			setTimeout(() => {
				const blob = new Blob(this.#recordedChunks, {
					type: "video/webm"
				});
				downloadBlob(blob, "recording.webm");
			},0);
		}
	}

	captureScreen(e){
		this.#shouldCapture = true;
	}

	onBackfaceChange(e){
		this.#isBackfaceCulled = e.target.checked;
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
