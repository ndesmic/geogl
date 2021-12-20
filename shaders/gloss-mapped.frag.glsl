precision mediump float;

varying vec4 vColor;
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vPosition;
uniform mat4 uLight1;
uniform vec3 uCamera;
uniform float specularity;
uniform sampler2D uSampler0;

void main() {
	bool isPoint = uLight1[3][3] == 1.0;
	vec3 normal = normalize(vNormal);

	if(isPoint) {
        //point light + color
		float gloss = exp2(texture2D(uSampler0, vUV).r * 6.0) + 2.0;
		vec3 toLightDir = normalize(uLight1[0].xyz - vPosition);
		float diffuseMagnitude = dot(normal, toLightDir);
		vec4 diffuseLight = vColor * uLight1[2] * vec4(diffuseMagnitude, diffuseMagnitude, diffuseMagnitude, 1);

		vec3 toCameraDir = normalize(uCamera - vPosition);
		vec3 halfVector = normalize(toLightDir + toCameraDir);
		float baseSpecular = clamp(dot(halfVector, normal), 0.0, 1.0) * float(clamp(diffuseMagnitude, 0.0, 1.0) > 0.0);
		float specularMagnitude = pow(baseSpecular, gloss);
		vec4 specularLight = uLight1[2] * specularity * vec4(specularMagnitude, specularMagnitude, specularMagnitude, 1.0);

		gl_FragColor = diffuseLight + specularLight;
	} else {
        //directional light + color
		float gloss = exp2(texture2D(uSampler0, vUV).r * 6.0) + 2.0;
		float diffuseMagnitude = dot(normal, uLight1[1].xyz);
		vec4 diffuseLight = vColor * uLight1[2] * vec4(diffuseMagnitude, diffuseMagnitude, diffuseMagnitude, 1);

		vec3 toCameraDir = normalize(uCamera - vPosition);
		vec3 halfVector = normalize(uLight1[1].xyz + toCameraDir);
		float baseSpecular = clamp(dot(halfVector, normal), 0.0, 1.0);
		float specularMagnitude = pow(baseSpecular, gloss);
		vec4 specularLight = uLight1[2] * specularity * vec4(specularMagnitude, specularMagnitude, specularMagnitude, 1.0);

		gl_FragColor = specularLight + diffuseLight;    
	}
}