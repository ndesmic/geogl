export function loadImage(url) {
	return new Promise((res, rej) => {
		const image = new Image();
		image.src = url;
		image.onload = () => res(image);
		image.onerror = rej;
	});
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
