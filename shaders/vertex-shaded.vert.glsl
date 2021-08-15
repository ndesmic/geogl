uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform lowp mat4 uLight1;

attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;
attribute vec2 aVertexUV;
attribute vec3 aVertexNormal;
varying mediump vec4 vColor;
varying mediump vec2 vUV;
varying mediump vec3 vNormal;
varying mediump vec3 vPosition;

varying mediump vec3 vToLight;
void main() {
	bool isPoint = uLight1[3][3] == 1.0;
	mediump vec3 normalNormal = normalize(vec3(uModelMatrix * vec4(aVertexNormal, 1.0)));
	mediump vec3 normalPosition = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));

	if(isPoint) {
		mediump vec3 toLight = normalize(uLight1[0].xyz - normalPosition);
		mediump float light = dot(normalNormal, toLight);
		vColor = vec4(aVertexColor, 1.0) * uLight1[2] * vec4(light, light, light, 1);
		vToLight = toLight;
	} else {
		mediump float light = max(0.0, dot(normalNormal, uLight1[1].xyz));
		vColor = vec4(aVertexColor, 1.0) * uLight1[2] * vec4(light, light, light, 1);
	}

	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);

	vUV = aVertexUV;
	vNormal = normalNormal;
	vPosition = normalPosition;
}