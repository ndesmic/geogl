varying mediump vec4 vColor;
varying mediump vec2 vUV;
varying mediump vec3 vNormal;
varying mediump vec3 vPosition;
uniform lowp mat4 uLight1;
uniform sampler2D uSampler;

void main() {
	bool isPoint = uLight1[3][3] == 1.0;
	if(isPoint) {
        //point light + color
		mediump vec3 toLight = normalize(uLight1[0].xyz - vPosition);
		mediump float light = dot(normalize(vNormal), toLight);
		gl_FragColor = vColor * uLight1[2] * vec4(light, light, light, 1);
	} else {
        //directional light + color
		mediump float light = dot(normalize(vNormal), uLight1[1].xyz);
		gl_FragColor = vColor * uLight1[2] * vec4(light, light, light, 1);
	}
}