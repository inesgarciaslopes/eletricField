attribute vec4 vPosition;

uniform float table_height;
uniform float table_width;

varying vec4 fColor;

void main()
{
    gl_PointSize = 20.0;
    
    fColor = vPosition.xyz == vec3(vPosition.xy, -1) ? vec4(1.0, 0.0, 0.0, 1.0) : vec4(0.0, 1.0, 0.0, 1.0);
   
    gl_Position = vPosition/vec4(vec2(table_width/2.0, table_height/2.0), 1.0, 1.0);
    

    
}