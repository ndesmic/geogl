import "./wc-glsl-shader-canvas.js";

export class WcGlslShaderEditor extends HTMLElement {
	static observedAttributes = [];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.render = element.render.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
		element.attachEvents = element.attachEvents.bind(element);
		element.onInput = element.onInput.bind(element);
		element.onKeyDown = element.onKeyDown.bind(element);
		element.onDragLeave = element.onDragLeave.bind(element);
		element.onDragOver = element.onDragOver.bind(element);
		element.onDrop = element.onDrop.bind(element);
		element.loadFile = element.loadFile.bind(element);
	}
	render() {
		this.attachShadow({ mode: "open" });

		this.shadowRoot.innerHTML = `
            <style>
                :host {
					display: block;
					height: 400px;
				}
				:host(.dragover){
					border: 2px solid #00cc00;
				}
				canvas { border: 1px solid black; }
				textarea { display: block; flex: 25% 1 1; height: 100%; }
				wc-glsl-shader-canvas { flex: 75% 1 1; }
				.row { display: flex; flex-flow: row nowrap; justify-content: space-between; align-items: stretch; height: 100%; gap: 20px; }
            </style>
			<div class="row">
				<textarea id="text-box"></textarea>
				<!-- seems like a bug where the internal gl context does not change resolution when the canvas does.. -->
				<wc-glsl-shader-canvas version="300" resize-to-image height="64" width="64">
#version 300 es
precision highp float;
uniform sampler2D u_image;
in vec2 vTextureCoordinate;
out vec4 fragColor;
void main() {
	vec4 source = texture(u_image, vTextureCoordinate);
	vec4 target = source;
	fragColor = target;
}
				</wc-glsl-shader-canvas>
			<div>
        `;
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
		this.dom.textBox.value = this.dom.canvas.textContent.trim();
	}
	cacheDom() {
		this.dom = {
			textBox: this.shadowRoot.querySelector("#text-box"),
			canvas: this.shadowRoot.querySelector("wc-glsl-shader-canvas")
		};
	}
	attachEvents() {
		this.dom.textBox.addEventListener("input", this.onInput);
		this.dom.textBox.addEventListener("keydown", this.onKeyDown);
		this.addEventListener("dragover", this.onDragOver);
		this.addEventListener("dragleave", this.onDragLeave);
		this.addEventListener("drop", this.onDrop);
	}
	loadFile(file) {
		const reader = new FileReader();
		reader.onerror = () => {
			this.setMessage(`failed to load file ${file.name}}`);
		}

		if (file.name.endsWith(".glsl")) {
			reader.readAsText(file, "utf8");
			reader.onload = e => {
				this.dom.canvas.text = e.target.result;
				this.dom.textBox.value = e.target.result;
			};
		} else {
			reader.readAsDataURL(file);
			reader.onload = e => {
				this.dom.canvas.image = e.target.result;
			};
		}
	}
	onInput(e){
		this.dom.canvas.text = e.target.value;
	}
	onKeyDown(e){
		if(e.key === "Tab"){
			e.preventDefault();
			const selectionStartIndex = this.selectionStart;
			e.target.value = e.target.value.substring(0, e.target.selectionStart) + "\t" + e.target.value.substring(e.target.selectionEnd);
			e.target.selectionEnd = selectionStartIndex + 1;
		}
	}
	onDragOver(e) {
		e.preventDefault();
		e.stopPropagation();
		this.classList.add("dragover");
	}
	onDragLeave(e) {
		e.preventDefault();
		e.stopPropagation();
		this.classList.remove("dragover");
	}
	onDrop(e) {
		e.preventDefault();
		this.classList.remove("dragover");
		const file = e.dataTransfer.files[0];
		this.loadFile(file);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}
}

customElements.define("wc-glsl-shader-editor", WcGlslShaderEditor);
