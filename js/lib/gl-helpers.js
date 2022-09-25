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

export async function loadUrl(url, type = "text"){
	const res = await fetch(url);
	switch(type){
		case "text": return res.text();
		case "blob": return res.blob();
		case "arrayBuffer": return res.arrayBuffer();
	}
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

export function bindAttribute(context, attributes, attributeName, size, program){
	program = program ?? context.getParameter(context.CURRENT_PROGRAM);
	attributes = attributes instanceof Float32Array ? attributes : new Float32Array(attributes);

	const attributeLocation = context.getAttribLocation(program, attributeName);
	if(attributeLocation === -1) return; //bail if it doesn't exist in the shader
	const attributeBuffer = context.createBuffer();
	context.bindBuffer(context.ARRAY_BUFFER, attributeBuffer);

	context.bufferData(context.ARRAY_BUFFER, attributes, context.STATIC_DRAW);

	context.enableVertexAttribArray(attributeLocation);
	context.vertexAttribPointer(attributeLocation, size, context.FLOAT, false, 0, 0);
}

export function createTexture(context, image, samplerParams = {}) {
	const texture = context.createTexture();
	context.bindTexture(context.TEXTURE_2D, texture);
	context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
	context.generateMipmap(context.TEXTURE_2D);

	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, samplerParams.wrapS ?? context.CLAMP_TO_EDGE);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, samplerParams.wrapT ?? context.CLAMP_TO_EDGE);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_LINEAR);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);

	return texture;
}

export function loadTexture(context, url, samplerParams = {}){
	return loadImage(url)
		.then(img => createTexture(context, img, samplerParams));
}

export function loadCubeMap(context, urls, samplerParams = {}){
	const faceToParam = [
		context.TEXTURE_CUBE_MAP_NEGATIVE_X,
		context.TEXTURE_CUBE_MAP_POSITIVE_Y,
		context.TEXTURE_CUBE_MAP_POSITIVE_Z,
		context.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		context.TEXTURE_CUBE_MAP_POSITIVE_X,
		context.TEXTURE_CUBE_MAP_NEGATIVE_Z
	];
	return Promise.all(urls.map(url => loadImage(url)))
		.then(imgs => {
			const texture = context.createTexture();
			context.bindTexture(context.TEXTURE_CUBE_MAP, texture);
			imgs.forEach((img, i) => {
				context.texImage2D(faceToParam[i], 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, img);
			});
			context.generateMipmap(context.TEXTURE_CUBE_MAP);
			context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_LINEAR);
			return texture;
		});
}

export function autoBindUniform(context, uniformName, uniformValue, program){
	program = program ?? context.getParameter(context.CURRENT_PROGRAM);
	const location = context.getUniformLocation(program, uniformName);
	if (!location) return;
	if (Array.isArray(uniformValue)) {
		switch (uniformValue.length) {
			case 1: {
				context.uniform1fv(location, uniformValue);
				break;
			}
			case 2: {
				context.uniform2fv(location, uniformValue);
				break;
			}
			case 3: {
				context.uniform3fv(location, uniformValue);
				break;
			}
			case 4: { //could also be a matrix 2x2...but we aren't using that
				context.uniform4fv(location, uniformValue);
				break;
			}
			case 9: {
				context.uniformMatrix3fv(location, false, uniformValue);
				break;
			}
			case 16: {
				context.uniformMatrix4fv(location, false, uniformValue);
				break;
			}
			default: {
				console.error(`Invalid dimension for binding uniforms. ${uniformName} with value of length ${uniformValue.length}`);
			}
		}
	} else {
		context.uniform1f(location, uniformValue);
	}
}