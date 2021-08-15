export function loadImage(url) {
	return new Promise((res, rej) => {
		const image = new Image();
		image.src = url;
		image.onload = () => res(image);
		image.onerror = rej;
	});
}

export function loadShader(context, url, type){
	return fetch(url)
		.then(r => r.text())
		.then(txt => compileShader(context, txt, type));
}

export async function loadProgram(context, url){
	const [vertexShader, fragmentShader] = await Promise.all([
		loadShader(context, `${url}.vert.glsl`, context.VERTEX_SHADER),
		loadShader(context, `${url}.frag.glsl`, context.FRAGMENT_SHADER)
	]);
	return compileProgram(context, vertexShader, fragmentShader);
}

export function compileShader(context, text, type) {
	const shader = context.createShader(type);
	context.shaderSource(shader, text);
	context.compileShader(shader);

	if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
		throw new Error(`Failed to compile ${type === context.VERTEX_SHADER ? "vertex" : "fragment"} shader: ${context.getShaderInfoLog(shader)}`);
	}
	return shader;
}

export function compileProgram(context, vertexShader, fragmentShader) {
	const program = context.createProgram();
	context.attachShader(program, vertexShader);
	context.attachShader(program, fragmentShader);
	context.linkProgram(program);

	if (!context.getProgramParameter(program, context.LINK_STATUS)) {
		throw new Error(`Failed to compile WebGL program: ${context.getProgramInfoLog(program)}`);
	}

	return program;
}

export function bindAttribute(context, attributes, attributeName, size){
	const attributeLocation = context.getAttribLocation(context.getParameter(context.CURRENT_PROGRAM), attributeName);
	if(attributeLocation === -1) return; //bail if it doesn't exist in the shader
	const attributeBuffer = context.createBuffer();
	context.bindBuffer(context.ARRAY_BUFFER, attributeBuffer);

	context.bufferData(context.ARRAY_BUFFER, attributes, context.STATIC_DRAW);

	context.enableVertexAttribArray(attributeLocation);
	context.vertexAttribPointer(attributeLocation, size, context.FLOAT, false, 0, 0);
}

export function createTexture(context, image) {
	const texture = context.createTexture();
	context.bindTexture(context.TEXTURE_2D, texture);
	context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
	context.generateMipmap(context.TEXTURE_2D);

	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_LINEAR);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);

	return texture;
}

export function loadTexture(context, url){
	return loadImage(url)
		.then(img => createTexture(context, img));
}