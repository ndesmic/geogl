#version 300 es

precision mediump float;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;

in vec3 aVertexPosition;
in vec3 aVertexColor;
in vec2 aVertexUV;
in vec3 aVertexNormal;
in vec3 aVertexTangent;

out vec4 color;
out vec2 uv;
out vec3 normal;
out vec3 position;
out vec3 tangent;
out vec3 bitangent;

void main() {
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
	uv = aVertexUV;
	color = vec4(aVertexColor, 1.0);
	normal = vec3(uModelMatrix * vec4(aVertexNormal, 1.0));
	tangent = vec3(uModelMatrix * vec4(aVertexTangent, 1.0));
	bitangent = cross(normal, tangent);
	position = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));
}