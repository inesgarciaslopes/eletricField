import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */

/* Joao Lopes Tomas 58164, Paula Ines Lopes 58655 */
/* Constant variables */
const table_width = 3.0;
const grid_spacing = 0.05;
const MAX_CHARGES = 20;

let gl;
let table_height;
let program;
let pProgram;
var vertices = [];
var points = []; 
let vlen = 0;
let plen = 0;
let aBuffer;
let pBuffer;
let vPosition;
let theta = 0.02;
let showCarges = true;

function animate(time)
{
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    /* Dealing with grid program and inicialization of attributes and uniforms */
    gl.useProgram(program);   
    var height  = gl.getUniformLocation(program, "table_height");
    var width = gl.getUniformLocation(program, "table_width");
    gl.uniform1f(width, table_width);
    gl.uniform1f(height, table_height);

    /* Giving the vertex the information about the charges position and value */
    let ind = gl.getUniformLocation(program, "index");
    gl.uniform1i(ind, plen);
    for(let i=0; i<plen; i++) 
    {
        const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
        gl.uniform3fv(uPosition, MV.vec3(points[i][0], points[i][1], points[i][2]));
        
    }
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.drawArrays(gl.LINES, 0, vlen);

    /* Dealing with charges program and inicialization of attributes and uniforms */
    gl.useProgram(pProgram);
    var height  = gl.getUniformLocation(pProgram, "table_height");
    var width = gl.getUniformLocation(pProgram, "table_width");
    gl.uniform1f(width, table_width);
    gl.uniform1f(height, table_height);
    vPosition = gl.getAttribLocation(pProgram, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(points));
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    /*Toggle charges hidden */
    if(showCarges == true){       
        gl.drawArrays(gl.POINTS, 0, plen);
    }
    rotate();
}

/* Dealing with rotation of charges */
function rotate(){

    let s = Math.sin(theta);
    let c= Math.cos(theta);

    for( let i = 0 ; i < plen ; i++ ){
        let pX = -s * points[i][1] + c * points[i][0];
        let pY = s * points[i][0] + c * points[i][1];
        let nX =  s * points[i][1] + c * points[i][0];
        let nY = - s * points[i][0] + c * points[i][1];
        
        if(points[i][2] == -1.0){
        points[i][0] = nX;
        points[i][1] =  nY;
        } else {
        points[i][0] = pX;
        points[i][1] =  pY;
        }
      
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(points), plen * MV.sizeof['vec3'], 0);

}

function setup(shaders)
{
    /* Initialize canvas dimensions */
    const canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    table_height = (table_width * canvas.height ) /canvas.width;

    gl = UTILS.setupWebGL(canvas);

    /* Initializing programs */
    pProgram = UTILS.buildProgramFromSources(gl, shaders["shaderP.vert"], shaders["shaderP.frag"]);
    program = UTILS.buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    /* Configure WebGL */
       gl.viewport(0,0,canvas.width, canvas.height);

    /* Colour of the canvas */
       gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
    /* Creating vertices for grid */
    for(let x = -(table_width/2); x <= table_width/2; x += grid_spacing) {
        for(let y = -(table_height/2); y <= table_height/2; y += grid_spacing) {
            const a =  x + grid_spacing* Math.random();
            const b =  y + grid_spacing* Math.random();
            vertices.push(MV.vec3(a, b, 0.0));
            vertices.push(MV.vec3(a, b, 1.0)); // Duplicate vertices
        }
    }

    vlen = vertices.length;

    /* Dealing with resize of window */
    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        table_height = (table_width * canvas.height ) /canvas.width;

    });

    /* Loading grid to GPU */
     aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer); 
    gl.bufferData(gl.ARRAY_BUFFER, vlen * MV.sizeof['vec3'] , gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0 , MV.flatten(vertices));

    /* Loading points to GPU */
     pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer); 
    gl.bufferData(gl.ARRAY_BUFFER, MAX_CHARGES * MV.sizeof['vec3'] , gl.STATIC_DRAW);

    /* Dealing with click event for new points */
    canvas.addEventListener("click", function(event) {
        const x = (-1 + 2*event.offsetX / canvas.width) * table_width/2;
        const y = (-1 + 2*(canvas.height - event.offsetY) / canvas.height) * table_height/2;
            
        if(plen < MAX_CHARGES - 1){

            if(event.shiftKey){
                points.push(MV.vec3(x, y, -1.0));
            } else {
                points.push(MV.vec3(x,y, 1.0));
            }

            gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(points), plen * MV.sizeof['vec3'], 0);
            plen++;
        }

    });

    /* Dealing with space key event to hide charges */
    window.onkeydown = function(event) {
        const key = String.fromCharCode(event.keyCode);
        if(key == ' '){
            showCarges=!showCarges;
        }}; 
  
    window.requestAnimationFrame(animate);
  
}

UTILS.loadShadersFromURLS(["shader.vert", "shader.frag", "shaderP.frag", "shaderP.vert"]).then(s => setup(s));