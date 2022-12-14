varying lowp vec2 vUV;
uniform sampler2D uSampler0;
void main() {
	gl_FragColor = texture2D(uSampler0, vUV);
}