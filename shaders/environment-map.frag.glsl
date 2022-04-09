precision mediump float;

uniform samplerCube uSampler;
uniform mat4 uViewProjectionInverse;

varying vec2 vPosition;

void main() {
	vec4 pos = uViewProjectionInverse * vec4(vPosition, 0.0, 1.0);
	gl_FragColor = textureCube(uSampler, normalize(pos.xyz / pos.w));
	//gl_FragColor = pos;
}