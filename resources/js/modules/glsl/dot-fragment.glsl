varying vec2 vUv;
uniform sampler2D prevMap;
uniform sampler2D nextMap;
uniform vec2 resolution;
uniform float r;
uniform float transition;
uniform float time;
uniform float bright;
uniform float statics;

const float scale = 4.;
const float Pi = 3.14159265359;
const float colorStep = 0.3;


// float x(float t) {
// 	t = mod(t, 4.0);
// 	return abs(t) - abs(t - 1.0) - abs(t - 2.0) + abs(t - 3.0) - 1.0;	
// }

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
	vec2 cellNum = vec2(floor(resolution.x / scale), floor(resolution.y / scale));
   	float vx = vUv.x;
   	float vy = vUv.y;
   	float T = time / resolution.x * 100.;

   	float g1Int = step(0.95, sin(T/1.5));
   	float g2Int = step(1.3, sin(T/1.5));

   	float oy = vy;

   	// vx = vx + sin(vx*resolution.x*Pi)/2.;
   	// vy = vy + cos(vy*resolution.y*Pi)/2.;

	vec2 p = vec2(floor(vx*cellNum.x)/cellNum.x, floor(vy*cellNum.y)/cellNum.y);

	// thats.. well. some random trigonometry i've come up with. hey, that's a glitch, right?!
	float intensCoef = sin(T/500.) / tan(T/300.);
	// do not show 2ns effect all the time. it's to crazy;
	float shyInt = step(1.3, sin(T/1.1) + cos(T/1.3));
	float shxInt = step(1.3, sin(T/3.) + cos(T/2.));
	// shy actually means shift Y.
	// some horizontal glitching; 1st - amp; 2nd - freq.
	float shx = sin(p.x*resolution.x*Pi/10. + T/2.) / resolution.x*5.;
	// f* do i know what's going on here. totaly unintensional, but looks interesting;
	float shy = 1./tan(p.y*resolution.y*Pi/30. * intensCoef + r/1000.)/resolution.y;
	// flips; 1st coef - frequency; 2nd - speed;
	float shy2 = 0.;
	float shx2 = clamp(tan(p.y*resolution.y/15. + T/1.), 0., 0.005);
	//float shy = 0.0;

	shy = shy*shyInt + shy2;
	shx = shx + shx2*shxInt;
	p.x = p.x + shx;
	p.y = p.y + shy;

	vec4 color;
	float rm = rand(p);
	float tr = step(rm, transition);
	color = (1.0 - statics) * ((tr * texture2D(prevMap, p) + (1.0 - tr) * texture2D(nextMap, p))) + (statics)*(rm);

	vec3 lum  = vec3(0.299, 0.587, 0.114);

	// vec4 blue = vec4(64./255., 219./255., 225./255., 1.);
	// vec4 grey = vec4(vec3(10./255.), 1.);

	vec4 brightStart  = vec4(89./255., 234./255., 240./255., 1.);
	vec4 brightEnd  = vec4(234./255., 35./255., 255./255., 1.);

	vec4 darkStart  = vec4(vec3(10./255.), 1.);
	vec4 darkEnd  = vec4(vec3(100./255.), 1.);

	vec4 colStart = mix(brightStart, darkStart, 1.0 - bright);
	vec4 colEnd = mix(brightEnd, darkEnd, 1.0 - bright);

	float gs  = dot(color.rgb, lum);

	// smooth colors. or not.
	vec3 colGs = smoothstep(colorStep + r, 1., vec3(gs))  + 0.25 - rand(p) / 4.;
	// vec3 colGs = step(colorStep + r, vec3(gs))/2. - rand(p)/4.;
	colGs = clamp(colGs, 0., 1.);

	// splitting on cells
	float sx = abs(sin((vUv.x)*cellNum.x*Pi));
	float sy = abs(sin((vUv.y)*cellNum.y*Pi));
	sx = smoothstep(0.3, 1., sx);
	sy = smoothstep(0.3, 1., sy);

	vec4 resultColor = vec4(colGs*sx*sy, 1.);

	gl_FragColor = mix(colStart, colEnd, (colGs*sx*sy).r);
}
