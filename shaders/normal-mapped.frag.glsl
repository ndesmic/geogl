#version 300 es

precision mediump float;

in vec2 uv;
in vec3 position;
in vec3 normal;
in vec3 tangent;
in vec3 bitangent;

out vec4 fragColor;

uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform mat4x4 uLight1;

void main() {

	//for normal maps
	//blue normal (UP)
	//green V (Y)
	//red U (x)
	mat3x3 tangentToWorld = mat3x3(
		tangent.x, bitangent.x, normal.x, 
		tangent.y, bitangent.y, normal.y, 
		tangent.z, bitangent.z, normal.z
	);

	vec3 colorSpaceNormal = texture(uSampler1, uv).xyz;
	vec3 tangentSpaceNormal = (colorSpaceNormal * 2.0) - 1.0;
	vec3 worldSpaceNormal = tangentToWorld * tangentSpaceNormal;

	vec4 tex = texture(uSampler0, uv);

	bool isPoint = uLight1[3][3] == 1.0;
	if(isPoint) {
        //point light + color
		vec3 toLight = normalize(uLight1[0].xyz - position);
		float light = dot(worldSpaceNormal, toLight);
		fragColor = tex * uLight1[2] * vec4(light, light, light, 1);
	} else {
        //directional light + color
		float light = dot(worldSpaceNormal, uLight1[1].xyz);
		fragColor = tex * uLight1[2] * vec4(light, light, light, 1);
	}
}