varying lowp vec2 vUV;
uniform sampler2D uSampler;
void main() {
	gl_FragColor = texture2D(uSampler, vUV);
}