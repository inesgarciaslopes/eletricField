precision highp float;
varying vec4 fColor;

void main()
{
    /* Dealing with rounding corners of charge */
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    float distance = length(fragmentPosition);
    if (distance > 0.6){
        discard;
    }
    
    /* Changing charges texture to a minus appearance */
    if( fragmentPosition[1] > -0.1 && fragmentPosition[1] < 0.1 && fragmentPosition[0] > -0.4 && fragmentPosition[0] < 0.4)
        discard;

    /* Changing charges texture to a plus appearance */
    if(fColor == vec4(0.0, 1.0, 0.0, 1.0))
    {
        if(fragmentPosition[1] > -0.4 && fragmentPosition[1] < 0.4 && fragmentPosition[0] > -0.1 && fragmentPosition[0] < 0.1)
            discard;

    }

    gl_FragColor = fColor;  
}