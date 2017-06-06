varying vec2 vUv;
uniform sampler2D prevMap;
uniform sampler2D nextMap;
uniform float transition;
uniform vec2 resolution;

float rand(float n) {
    return fract(753.5453123*sin(n + 113.));
}

float noise(vec3 x) { 
    vec3 p = floor(x); 
    vec3 f = fract(x); 
    f = f*f*(3.-2.*f); 

    float n = p.x + p.y*157. + 113.*p.z; 

    float v2 = rand(n); 
    return v2; 
}
float fnoise(vec3 p) { 
    p.z = p.z;
    return dot(vec3(noise(p), noise(p*2.),  noise(p*4.)), 
    vec3(0.5, 0.25, 0.2)); 
}

void main() {
    float vx = vUv.x;
    float vy = vUv.y;

    vec3 p = vec3(vUv.x*30., vUv.y*20., 0.);

    float ns = fnoise(p); 
    float tr = step(ns, transition);

    vec4 color = tr * texture2D(prevMap, vUv.xy) + (1.0 - tr) * texture2D(nextMap, vUv.xy);
    gl_FragColor = color;
}
