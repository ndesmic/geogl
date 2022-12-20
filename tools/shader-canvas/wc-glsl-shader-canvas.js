
import { compileShader, compileProgram } from "../../js/lib/gl-helpers.js";

function loadImage(url) {
	return new Promise((res, rej) => {
		const image = new Image();
		image.src = url;
		image.onload = () => res(image);
		image.onerror = rej;
	});
}

export class WcGlslShaderCanvas extends HTMLElement {
	static observedAttributes = ["image", "height", "width", "colors", "globals", "version", "resize-to-image"];
	#height = 240;
	#width = 320;
	#image;
	#colors;
	#setReady;
	#globals;
	#version;
	#text;
	#resizeToImage = false;
	ready = new Promise(res => { this.#setReady = res; });
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents = element.attachEvents.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
		element.createShadowDom = element.createShadowDom.bind(element);
		element.bootGpu = element.bootGpu.bind(element);
		element.compileShaders = element.compileShaders.bind(element);
		element.render = element.render.bind(element);
		element.update = element.update.bind(element);
	}
	async connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		this.attachEvents();
		await this.bootGpu();
		this.update();
		this.#setReady();
	}
	createShadowDom() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
				<style>
					:host { display: block; }
					:host(.dragover) {
						border: 2px solid green;
					}
					#message { display: none; }
				</style>
				<canvas width="${this.#width}" height="${this.#height}"></canvas>
				<div id="message"></div>
			`;
	}
	update() {
		if (!this.context) return;
		this.createUniforms();
		this.render();
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("canvas"),
			message: this.shadowRoot.querySelector("#message")
		};
	}
	attachEvents() {
	}
	async bootGpu() {
		this.context = this.dom.canvas.getContext("webgl2", { preserveDrawingBuffer: true });
		this.compileShaders();
		this.createPositions();
		this.createUvs();
		this.createIndicies();
		this.createColors();
		if (this.#image) {
			this.createTexture(await loadImage(this.#image));
		}
	}
	createPositions() {
		const positions = new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			1.0, 1.0,
			-1.0, 1.0
		]);
		const positionBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, positions, this.context.STATIC_DRAW);

		const positionLocation = this.context.getAttribLocation(this.program, "aVertexPosition");
		this.context.enableVertexAttribArray(positionLocation);
		this.context.vertexAttribPointer(positionLocation, 2, this.context.FLOAT, false, 0, 0);
	}
	createColors() {
		const colors = new Float32Array(this.#colors);
		const colorBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, colors, this.context.STATIC_DRAW);

		const colorLocation = this.context.getAttribLocation(this.program, "aVertexColor");
		this.context.enableVertexAttribArray(colorLocation);
		this.context.vertexAttribPointer(colorLocation, 4, this.context.FLOAT, false, 0, 0);
	}
	createUvs() {
		const uvs = new Float32Array([
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0
		]);
		const uvBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, uvBuffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, uvs, this.context.STATIC_DRAW);

		const texCoordLocation = this.context.getAttribLocation(this.program, "aTextureCoordinate");
		this.context.enableVertexAttribArray(texCoordLocation);
		this.context.vertexAttribPointer(texCoordLocation, 2, this.context.FLOAT, false, 0, 0);
	}
	createIndicies() {
		const indicies = new Uint16Array([
			0, 1, 2,
			0, 2, 3
		]);
		const indexBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);
		this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, indicies, this.context.STATIC_DRAW);
	}
	createTexture(image) {
		const texture = this.context.createTexture();
		this.context.bindTexture(this.context.TEXTURE_2D, texture);

		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);

		this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, image);
	}
	createUniforms() {
		if (!this.#globals) return;
		Object.entries(this.#globals).forEach(([key, val]) => {
			const location = this.context.getUniformLocation(this.program, key);
			if (!location) return;

			if (Array.isArray(val)) {
				switch (val.length) {
					case 1: {
						this.context.uniform1fv(location, val);
					}
					case 2: {
						this.context.uniform2fv(location, val);
					}
					case 3: {
						this.context.uniform3fv(location, val);
					}
					case 4: {
						this.context.uniform4fv(location, val);
					}
					default: {
						console.error(`Invalid dimension for binding uniforms. ${key} with value of length ${val.length}`);
					}
				}
			} else {
				this.context.uniform1f(location, val);
			}
		});
	}
	compileShaders() {
		this.unsetMessage();
		const vertexShaderText = this.#version === "300" 
			? ` #version 300 es
				in vec3 aVertexPosition;
				in vec2 aTextureCoordinate;
				in vec4 aVertexColor;
				out vec2 vTextureCoordinate;
				out vec4 vColor;

				void main(){
					gl_Position = vec4(aVertexPosition, 1.0);
					vTextureCoordinate = aTextureCoordinate;
					vColor = aVertexColor;
				}`
			: `
				attribute vec3 aVertexPosition;
				attribute vec2 aTextureCoordinate;
				attribute vec4 aVertexColor;
				varying vec2 vTextureCoordinate;
				varying vec4 vColor;

				void main(){
					gl_Position = vec4(aVertexPosition, 1.0);
					vTextureCoordinate = aTextureCoordinate;
					vColor = aVertexColor;
				}`;

		this.vertextShader = compileShader(this.context, vertexShaderText, this.context.VERTEX_SHADER);
		
		const fragmentShaderText = (this.#text ?? this.textContent).trim();
		if(fragmentShaderText === ""){
			this.setMessage("No fragment shader set");
			return;
		};
		
		this.fragmentShader = compileShader(this.context, fragmentShaderText, this.context.FRAGMENT_SHADER);
		
		this.program = compileProgram(this.context, this.vertextShader, this.fragmentShader);
		this.context.useProgram(this.program);
	}
	setMessage(message) {
		this.dom.message.textContent = message;
		this.dom.message.style.display = "block";
		this.dom.canvas.style.display = "none";
	}
	unsetMessage() {
		this.dom.message.textContent = "";
		this.dom.message.style.display = "none";
		this.dom.canvas.style.display = "block";
	}
	render() {
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
		this.context.drawElements(this.context.TRIANGLES, 6, this.context.UNSIGNED_SHORT, 0);
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
			this.dom.canvas.width = value;
		}
	}
	set image(value) {
		this.#image = value;
		loadImage(value)
			.then(img => {
				this.createTexture(img);
				if(this.#resizeToImage){
					this.height = img.naturalHeight;
					this.width = img.naturalWidth;
					this.createPositions();
				}
			})
			.then(() => this.render());
	}
	set colors(value) {
		this.#colors = value.split(/[,;\s]\s*/g).map(x => parseFloat(x.trim()));
	}
	get pixelData() {
		return this.ready.then(() => {
			const array = new Uint8Array(this.#height * this.#width * 4);
			this.context.readPixels(0, 0, this.#width, this.#height, this.context.RGBA, this.context.UNSIGNED_BYTE, array);
			return [...array].map(x => x / 255);
		});
	}
	set globals(val) {
		val = typeof (val) === "object" ? val : JSON.parse(val);
		this.#globals = val;
		this.update();
	}
	get ["resize-to-image"](){
		return this.#resizeToImage;
	}
	set ["resize-to-image"](val){
		this.#resizeToImage = val === true || val === "";
	}
	get version(){
		return this.#version;
	}
	set version(val){
		this.#version = val;
	}
	get text(){
		return this.#text;
	}
	set text(val){
		this.#text = val;
		this.bootGpu();
		this.render();
	}
	//TODO: throw away program on detach
}

customElements.define("wc-glsl-shader-canvas", WcGlslShaderCanvas);
