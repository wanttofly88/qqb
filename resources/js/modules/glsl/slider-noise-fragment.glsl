varying vec2 vUv;
uniform sampler2D prevMap;
uniform sampler2D nextMap;
uniform float transition;
uniform vec2 resolution;
uniform float time;
uniform float n;

const float Pi = 3.14159265359;

float rand(vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898, 90.233)) + time) * 43758.5453);
}
float randFixed(vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898, 90.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);
    
    float res = mix(
        mix(randFixed(ip), randFixed(ip + vec2(1.0, 0.0)), u.x),
        mix(randFixed(ip + vec2(0.0, 1.0)),randFixed(ip + vec2(1.0, 1.0)), u.x), u.y);
    return res * res;
}

void main() {
    float vx = vUv.x;
    float vy = vUv.y;

    float n1 = rand(vUv.xy);
    float n2 = noise(vUv.xy);
    float intens = n;
    float ad = 0.0;

    float r = rand(vec2(time, time));

    float T = time / resolution.x * 100.;

    float shyInt = step(1.3, sin(T/1.1) + cos(T/1.3))/2.0;
    float shxInt = step(1.3, sin(T/3.) + cos(T/2.))/2.0;

    float shx2 = clamp(tan(vy*resolution.x/200. + T/1.), 0., 0.01);

    float shy = 0.0;
    float shx = shx2*shyInt/14.0;
    vx = vx + shx;
    vy = vy + shy;

    ad = ad + r*shyInt/40.;


    vec4 color = transition * texture2D(prevMap, vec2(vx, vy)) 
        + (1.0 - transition) * texture2D(nextMap, vec2(vx, vy)) + ((n1 + n2)/3.0 - 0.25)*intens;
    gl_FragColor = vec4(color.r + ad, color.g + ad, color.b + ad, 1.0);
}
