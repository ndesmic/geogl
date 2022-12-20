import { normalizeVector } from "../../js/lib/vector.js";
import { sample, convolute, setPx } from "../../js/lib/image-helper.js";

const naiveDxKernel = [
	[0, 0, 0],
	[1, 0, -1],
	[0, 0, 0]
];
const naiveDyKernal = [
	[0, -1, 0],
	[0, 0, 0],
	[0, 1, 0]	
];
const sobelDxKernel = [
	[1, 0, -1],
	[2, 0, -2],
	[1, 0, -1]
];
const sobelDyKernel = [
	[-1, -2, -1],
	[0, 0, 0],
	[1, 2, 1]
];
const scharrDxKernel = [
	[3, 0, -3],
	[10, 0, -10],
	[3, 0, -3]
];
const scharrDyKernel = [
	[-3, -10, -3],
	[0, 0, 0],
	[3, 10, 3]
];
const prewittDyKernel = [
	[-1, -1, -1],
	[0, 0, 0],
	[1, 1, 1]
];
const prewittDxKernel = [
	[1, 0, -1],
	[1, 0, -1],
	[1, 0, -1]
];
const kernels = {
	naive: {
		x: naiveDxKernel,
		y: naiveDyKernal
	},
	sobel: {
		x: sobelDxKernel,
		y: sobelDyKernel
	},
	scharr: {
		x: scharrDxKernel,
		y: scharrDyKernel
	},
	prewitt: {
		x: prewittDxKernel,
		y: prewittDyKernel
	}
}

class BumpMapConverter extends HTMLElement {
	#img = null;
	#kernel = "naive";

	static get observedAttributes() {
		return [];
	}
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents = element.attachEvents.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
		element.createDom = element.createDom.bind(element);
		element.convert = element.convert.bind(element);
		element.fileChanged = element.fileChanged.bind(element);
		element.strengthChanged = element.strengthChanged.bind(element);
		element.kernelChanged = element.kernelChanged.bind(element);
	}
	createDom() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				.row { display: flex; flex-flow: row nowrap; }
				.col { display: flex; flex-flow: column nowrap; align-items: center; }
			</style>
			<div>
				<div class="row">
					<canvas id="bump-map"></canvas>
        			<canvas id="normal-map"></canvas>
				</div>
				<div class="col">
					<input type="file" id="file-input" accept="image/*" />
					<label>
						<span>Strength</span>
						<input type="range" id="strength" min="0" max="50" value="10">
						<span id="str-label"></span>
					</label>
					<label>
						<span>Kernel</span>
						<select id="kernel">
							<option value="naive" selected>Naive</options>
							<option value="sobel">Sobel</options>
							<option value="scharr">Sharr</options>
							<option value="prewitt">Prewitt</options>
						</select>
					</label>
					<button id="convert-btn">Convert</button>
				</div>
			</div>
		`
	}
	connectedCallback() {
		this.createDom();
		this.cacheDom();
		this.attachEvents();
		this.dom.strLabel.textContent = this.dom.strength.value;
	}
	cacheDom() {
		this.dom = {
			convertBtn: this.shadowRoot.querySelector("#convert-btn"),
			bumpMap: this.shadowRoot.querySelector("#bump-map"),
			normalMap: this.shadowRoot.querySelector("#normal-map"),
			fileInput: this.shadowRoot.querySelector("#file-input"),
			strength: this.shadowRoot.querySelector("#strength"),
			strLabel: this.shadowRoot.querySelector("#str-label"),
			kernel: this.shadowRoot.querySelector("#kernel")
		};
	}
	attachEvents() {
		this.dom.fileInput.addEventListener("change", this.fileChanged);
		this.dom.convertBtn.addEventListener("click", this.convert);
		this.dom.strength.addEventListener("input", this.strengthChanged);
		this.dom.kernel.addEventListener("change", this.kernelChanged);
	}
	strengthChanged(e){
		this.dom.strLabel.textContent = e.target.value;
		this.convert();
	}
	kernelChanged(){
		this.#kernel = this.dom.kernel.value;
		this.convert();
	}
	fileChanged(e) {
		const file = this.dom.fileInput.files[0];

		const reader = new FileReader();
		reader.onload = (e) => {
			this.#img = new Image();
			this.#img.onload = () => {
				this.convert();
			}
			this.#img.src = e.target.result;
		};
		reader.readAsDataURL(file);
	}
	convert() {
		if(!this.#img) return;
		const width = this.#img.naturalWidth;
		const height = this.#img.naturalHeight;
		const bumpMapCanvas = this.dom.bumpMap;
		const normalMapCanvas = this.dom.normalMap;
		const bumpMapCtx = bumpMapCanvas.getContext("2d");
		const normalMapCtx = normalMapCanvas.getContext("2d");
		bumpMapCanvas.width = width;
		bumpMapCanvas.height = height;
		normalMapCanvas.width = width;
		normalMapCanvas.height = height;
		bumpMapCtx.drawImage(this.#img, 0, 0, width, height);
		const bumpMapData = bumpMapCtx.getImageData(0, 0, width, height);
		const normalMapData = normalMapCtx.getImageData(0, 0, width, height);
		const strength = this.dom.strength.valueAsNumber;

		const { x: dxKernel, y: dyKernel } = kernels[this.#kernel]; 

		const xNormals = convolute(bumpMapData, dxKernel, { x: "clamp", y: "clamp" })
		const yNormals = convolute(bumpMapData, dyKernel, { x: "clamp", y: "clamp" })

		for (let row = 0; row < height; row++) {
			for (let col = 0; col < width; col++) {
				const valX = sample(xNormals, row, col);
				const valY = sample(yNormals, row, col);
				const tangentSpaceNormal = normalizeVector([valX[0], valY[0], 1.0/strength]);

				const colorSpaceNormal = [
					(tangentSpaceNormal[0] + 1) / 2,
					(tangentSpaceNormal[1] + 1) / 2,
					(tangentSpaceNormal[2] + 1) / 2,
				];

				setPx(normalMapData, row, col, [
					colorSpaceNormal[0],
					colorSpaceNormal[1],
					colorSpaceNormal[2],
					1.0
				]);
			}
		}

		normalMapCtx.putImageData(normalMapData, 0, 0);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}
}

customElements.define("bump-map-converter", BumpMapConverter);