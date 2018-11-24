#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord*4.0);
	vec4 filter = texture2D(uSampler2, vec2(0.0,0.05)+vTextureCoord);

	if (filter.r != 64.0/255.0)
		color=vec4(0.2, 0.0, 0.1, 1.0)*(1.0-filter.r)*1.0;
	
	gl_FragColor = color;
}