#version 300 es

precision mediump float;

in vec2 uv;
in vec3 position;
in vec3 normal;
in vec3 tangent;
in vec3 bitangent;
in vec4 color;

out vec4 fragColor;

uniform sampler2D uSampler0;
uniform float scale;
uniform mat4x4 uLight1;

void main() {
	//for normal maps
	//blue normal (UP)
	//green V (Y)
	//red U (x)
	ivec2 size = textureSize(uSampler0, 0);
	float du = 1.0 / float(size[0]);
	float dv = 1.0 / float(size[1]);

	//sample a pixel to either side
	float positiveU = texture(uSampler0, uv + vec2(du, 0))[0] * scale;
	float positiveV = texture(uSampler0, uv + vec2(0, dv))[0] * scale;
	float negativeU = texture(uSampler0, uv + vec2(-du, 0))[0] * scale;
	float negativeV = texture(uSampler0, uv + vec2(0, -dv))[0] * scale;

	mat3x3 tangentToWorld = mat3x3(
		tangent.x, bitangent.x, normal.x,
		tangent.y, bitangent.y, normal.y,
		tangent.z, bitangent.z, normal.z
	);

	vec3 uComponent = vec3(du, 0.0, -(positiveU - negativeU));
	vec3 vComponent = vec3(0.0, dv, -(positiveV - negativeV));
	vec3 tangentSpaceNormal = uComponent + vComponent;
	vec3 worldSpaceNormal = normalize(tangentToWorld * tangentSpaceNormal);

	bool isPoint = uLight1[3][3] == 1.0;
	if(isPoint) {
        //point light + color
		vec3 toLight = normalize(uLight1[0].xyz - position);
		float light = dot(normalize(worldSpaceNormal), toLight);
		fragColor = color * uLight1[2] * vec4(light, light, light, 1);
	} else {
        //directional light + color
		float light = dot(normalize(worldSpaceNormal), uLight1[1].xyz);
		fragColor = color * uLight1[2] * vec4(light, light, light, 1);
	}

	//fragColor = vec4(worldSpaceNormal, 1.0);
	//fragColor = texture(uSampler0, uv);
}