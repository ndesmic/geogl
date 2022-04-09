precision mediump float;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat3 uNormalMatrix;

attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;
attribute vec2 aVertexUV;
attribute vec3 aVertexNormal;

varying vec4 vColor;
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
	vUV = aVertexUV;
	vColor = vec4(aVertexColor, 1.0);
	vNormal = uNormalMatrix * aVertexNormal;
	vPosition = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));
}