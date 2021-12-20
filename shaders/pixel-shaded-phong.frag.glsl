precision mediump float;

varying vec4 vColor;
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vPosition;

uniform mat4 uLight1;
uniform sampler2D uSampler;
uniform vec3 uCamera;
uniform float gloss;

void main() {
	bool isPoint = uLight1[3][3] == 1.0;
	vec3 normal = normalize(vNormal);

	if(isPoint) {
        //point light + color
		vec3 toLight = normalize(uLight1[0].xyz - vPosition);
		float light = dot(normal, toLight);

		vec3 toCameraDir = normalize(uCamera - vPosition);
		vec3 reflectedLightDir = reflect(-toLight, normal);
		float baseSpecular = clamp(dot(reflectedLightDir, toCameraDir), 0.0, 1.0);
		float specularLight = pow(baseSpecular, gloss);

		gl_FragColor = (uLight1[2] * vec4(specularLight, specularLight, specularLight, 1.0)) + (vColor * uLight1[2] * vec4(light, light, light, 1));
	} else {
        //directional light + color
		float light = dot(normal, uLight1[1].xyz);

		vec3 toCameraDir = normalize(uCamera - vPosition);
		vec3 reflectedLightDir = reflect(-uLight1[1].xyz, normal);  
		float baseSpecular = clamp(dot(reflectedLightDir, toCameraDir), 0.0, 1.0);
		float specularLight = pow(baseSpecular, gloss);

		gl_FragColor = (uLight1[2] * vec4(specularLight, specularLight, specularLight, 1.0)) + (vColor * uLight1[2] * vec4(light, light, light, 1));
	}
}