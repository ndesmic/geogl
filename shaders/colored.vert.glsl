uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;

attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;
varying mediump vec4 vColor;

void main() {
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
	vColor = vec4(aVertexColor, 1.0);
}