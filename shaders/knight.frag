#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform float selected;


void main() {
	vec4 color = texture2D(uSampler, vTextureCoord*vec2(3.0, 3.0));
	vec4 filter = texture2D(uSampler2, vTextureCoord);

//if(selected != 1.0){
	if(filter.r< 0.8){
		float a = filter.r+0.5;
		color*=vec4(a, a, a, 1.0);
	}
	
	gl_FragColor = color;
}