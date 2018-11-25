
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
uniform sampler2D uSampler2;
uniform float randval;

uniform float normScale;

float rand(float n){return fract(sin(n) * 43758.5453123);}

// float noise(float p){
// 	float fl = floor(p);
//   float fc = fract(p);
// 	return mix(rand(fl), rand(fl + 1.0), fc);
// }
	
// float noise(vec2 n) {
// 	const vec2 d = vec2(0.0, 1.0);
//   vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
// 	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
// }

void main() {
	vec3 offset=vec3(0.0,0.0,sin(aVertexPosition[1]*3.14*6.0)*0.8*randval);
	
	vTextureCoord = aTextureCoord;

	offset+=aVertexNormal*(normScale+texture2D(uSampler2, aTextureCoord).b * aVertexPosition);

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
}
