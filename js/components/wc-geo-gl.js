import { Mesh } from "../lib/mesh.js";
import { cube, quadPyramid, quad } from "../data.js";
import { getProjectionMatrix } from "../lib/vector.js";

function loadImage(url) {
	return new Promise((res, rej) => {
		const image = new Image();
		image.src = url;
		image.onload = () => res(image);
		image.onerror = rej;
	});
}

function compileShader(context, text, type){
	const shader = context.createShader(type);
	context.shaderSource(shader, text);
	context.compileShader(shader);

	if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
		throw new Error(`Failed to compile shader: ${context.getShaderInfoLog(shader)}`);
	}
	return shader;
}

function compileProgram(context, vertexShader, fragmentShader){
	const program = context.createProgram();
	context.attachShader(program, vertexShader);
	context.attachShader(program, fragmentShader);
	context.linkProgram(program);

	if (!context.getProgramParameter(program, context.LINK_STATUS)) {
		throw new Error(`Failed to compile WebGL program: ${context.getProgramInfoLog(program)}`);
	}

	return program;
}

export class WcGeoGl extends HTMLElement {
	static observedAttributes = ["image", "height", "width"];
	#height = 720;
	#width = 1280;
	#image;
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents = element.attachEvents.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
		element.createShadowDom = element.createShadowDom.bind(element);
		element.bootGpu = element.bootGpu.bind(element);
		element.render = element.render.bind(element);
	}
	async connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		this.attachEvents();
		await this.bootGpu();
		this.createMeshes();
		await this.loadTextures();
		this.setupGlobalUniforms();
		this.render();
	}
	createShadowDom() {
		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.innerHTML = `
				<style>
					:host { display: block; }
				</style>
				<canvas width="${this.#width}px" height="${this.#height}px"></canvas>
			`;
	}
	cacheDom() {
		this.dom = {};
		this.dom.canvas = this.shadow.querySelector("canvas");
	}
	attachEvents() {

	}
	async bootGpu() {
		this.context = this.dom.canvas.getContext("webgl2");
		this.program = this.context.createProgram();
	
		const vertexShader = compileShader(this.context, `
				uniform mat4 uProjectionMatrix;
				uniform mat4 uModelMatrix;
				
				attribute vec3 aVertexPosition;
				attribute vec3 aVertexColor;
				attribute vec2 aVertexUV;

				varying mediump vec4 vColor;
				varying mediump vec2 vUV;

				void main(){
					gl_Position = uProjectionMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
					vColor = vec4(aVertexColor, 1.0);
					vUV = aVertexUV;
				}
			`, this.context.VERTEX_SHADER);

		const fragmentShader = compileShader(this.context, `
		    varying lowp vec4 vColor;
			varying lowp vec2 vUV;

			uniform sampler2D uSampler;

			void main() {
				gl_FragColor = texture2D(uSampler, vUV);
				//gl_FragColor = vColor;
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
		};
	}

	createMeshes(){
		const tcube = new Mesh(cube);
		tcube.setRotation({ x: -Math.PI / 4, y: Math.PI / 4 });
		tcube.setTranslation({ z: 2 });

		//const tpyramid = new Mesh(quadPyramid);
		//tpyramid.setRotation({ y: Math.PI / 4 });
		//tpyramid.setTranslation({ z: 2, x: -0.75 });

		//const tquad = new Mesh(quad);
		//tquad.setTranslation({ z: 1 });

		this.meshes = {
			//pyramid: tpyramid,
			cube: tcube,
			//quad: tquad
		};
	}

	bindMesh(mesh){
		this.bindPositions(mesh.positions);
		this.bindColors(mesh.colors);
		this.bindUvs(mesh.uvs);
		this.bindIndices(mesh.triangles);
		this.bindUniforms(mesh.getModelMatrix());
		this.bindTexture(mesh.textureName);
	}

	bindPositions(positions) {
		const positionBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);

		this.context.bufferData(this.context.ARRAY_BUFFER, positions, this.context.STATIC_DRAW);

		const positionLocation = this.context.getAttribLocation(this.program, "aVertexPosition");
		this.context.enableVertexAttribArray(positionLocation);
		this.context.vertexAttribPointer(positionLocation, 3, this.context.FLOAT, false, 0, 0);
	}
	bindColors(colors){
		const colorBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);

		this.context.bufferData(this.context.ARRAY_BUFFER, colors, this.context.STATIC_DRAW);

		const vertexColorLocation = this.context.getAttribLocation(this.program, "aVertexColor");
		this.context.enableVertexAttribArray(vertexColorLocation);
		this.context.vertexAttribPointer(vertexColorLocation, 3, this.context.FLOAT, false, 0, 0);
	}
	bindUvs(uvs) {
		const uvBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, uvBuffer);

		this.context.bufferData(this.context.ARRAY_BUFFER, uvs, this.context.STATIC_DRAW);

		const vertexUvLocation = this.context.getAttribLocation(this.program, "aVertexUV");
		this.context.enableVertexAttribArray(vertexUvLocation);
		this.context.vertexAttribPointer(vertexUvLocation, 2, this.context.FLOAT, false, 0, 0);
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
		const projectionMatrix = new Float32Array(getProjectionMatrix(this.#height, this.#width, 90, 0.01, 100).flat());
		const projectionLocation = this.context.getUniformLocation(this.program, "uProjectionMatrix");
		this.context.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
	}
	createTexture(image) {
		const texture = this.context.createTexture();
		this.context.bindTexture(this.context.TEXTURE_2D, texture);
		this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, image);

		this.context.generateMipmap(this.context.TEXTURE_2D);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR_MIPMAP_LINEAR);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR_MIPMAP_LINEAR);

		return texture;
	}
	render() {
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
		for (const mesh of Object.values(this.meshes)){
			this.bindMesh(mesh);
			this.context.drawElements(this.context.TRIANGLES, mesh.triangles.length, this.context.UNSIGNED_SHORT, 0);
		}
	}
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
	set image(value) {
		this.#image = value;
		loadImage(value)
			.then(img => this.createTexture(img));
	}
	//TODO: throw away program on detach
}

customElements.define("wc-geo-gl", WcGeoGl);
