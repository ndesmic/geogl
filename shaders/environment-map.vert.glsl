precision mediump float;

attribute vec2 aVertexPosition;
varying vec2 vPosition;

void main() {
	vPosition = aVertexPosition;
	gl_Position = vec4(aVertexPosition, 0.999, 1.0);
}