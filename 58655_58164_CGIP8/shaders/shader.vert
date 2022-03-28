attribute vec4 vPosition;

varying vec4 fColor;
uniform float table_height;
uniform float table_width;

const int MAX_CHARGES=20;
const float MAX_LEN = 0.05*3.0;
const float SCALE = 0.1;
uniform vec3 uPosition[MAX_CHARGES];

#define Ke 8.988e9
#define TWOPI 6.28318530718

vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f)
{
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}

/* Calculate the eletric field of a charge */
vec2 eletricField(vec3 c)
{
    float r = length((vPosition.xy - c.xy)); //vPosition.xy - c.xy returns a vec2 , if we want radius we use length of vec2
    float field = Ke * c[2] / ( r * r);
    return normalize(vPosition.xy - c.xy) * field * SCALE;
}

/* Calculate the vector of eletric field to apply */
void field()
{
    vec4 sumField;
    for(int i = 0; i <MAX_CHARGES; i++){
        sumField += vec4(eletricField(uPosition[i]), 0.0, 0.0);
    }

    if(length(sumField) > MAX_LEN){
        sumField = sumField * MAX_LEN / length(sumField);
        }
    
    sumField = vPosition + sumField;
    gl_Position = sumField/ vec4(vec2(table_width/2.0, table_height/2.0), 1.0, 1.0);
}

void main()
{
    gl_PointSize = 4.0;
    gl_Position = vPosition/vec4(vec2(table_width/2.0, table_height/2.0), 1.0, 1.0);

    /* For replicate grid points, we are changing their positions */
    if(vPosition.z == 1.0){
        field();
    }

    /* Dealing with grid color */
    if(vPosition.z == 0.0){
        fColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        fColor = colorize(vPosition.xy);
    }   
}