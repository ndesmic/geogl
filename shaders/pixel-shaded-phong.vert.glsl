uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;

attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;
attribute vec2 aVertexUV;
attribute vec3 aVertexNormal;

varying mediump vec4 vColor;
varying mediump vec2 vUV;
varying mediump vec3 vNormal;
varying mediump vec3 vPosition;

void main() {
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
	vUV = aVertexUV;
	vColor = vec4(aVertexColor, 1.0);
	vNormal = vec3(uModelMatrix * vec4(aVertexNormal, 1.0));
	vPosition = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));
}