#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;


struct lightProperties {
    vec4 position;                  
    vec4 ambient;                   
    vec4 diffuse;                   
    vec4 specular;                  
    vec4 half_vector;
    vec3 spot_direction;            
    float spot_exponent;            
    float spot_cutoff;              
    float constant_attenuation;     
    float linear_attenuation;       
    float quadratic_attenuation;    
    bool enabled;                   
};

#define NUMBER_OF_LIGHTS 8
uniform lightProperties uLight[NUMBER_OF_LIGHTS];


void main() {
	vec4 color = texture2D(uSampler, vTextureCoord*4.0);
	vec4 filter = texture2D(uSampler2, vec2(0.0,0.05)+vTextureCoord);

	if (filter.r != 64.0/255.0)
		color=vec4(0.2, 0.0, 0.1, 1.0)*(1.0-filter.r)*1.0;
	
	if(uLight[0].enabled)
		gl_FragColor = color;
	else
		gl_FragColor= vec4(0.0, 0.0, 0.0, 1.0);

}