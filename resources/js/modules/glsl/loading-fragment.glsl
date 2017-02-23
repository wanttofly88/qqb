varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 res;
uniform float Fi;
uniform float fact;
uniform float globalA;
uniform float disA;

float rand(float n) {
    return fract(753.5453123*sin(n + 113.));
}

float noise(vec3 x) { 
    vec3 p = floor(x); 
    vec3 f = fract(x); 
    f = f*f*(3.-2.*f); 

    float n = p.x + p.y*157. + 113.*p.z * fact/100.0; 

    float v2 = rand(n); 
    return v2; 
}
float fSimpNoise(vec3 p) { 
    p.z = p.z + fact*16.0;
    return dot(vec3(noise(p), noise(p*2.),  noise(p*4.)), 
    vec3(0.5, 0.25, 0.2)); 
}
float fnoise(vec3 p) { 
    p.z = p.z + fact*6.0;
    return dot(vec4(noise(p), noise(p*2.3), noise(p*4.3), noise(p*8.4)), 
    vec4(0.5, 0.25, 0.2, 0.125)); 
}

float insideBox(vec2 v, vec2 bottomLeft, vec2 topRight) {
    vec2 s = step(bottomLeft, v) - step(topRight, v);
    return s.x * s.y;   
}

void main() {
    float vx = vUv.x;
    float vy = vUv.y;

    vec3 vUv2 = mat3(
        1.0 - Fi, 0., 0.,
        0., 1.0 - Fi, 0.,
        0., 0., 1.0 - Fi)*
    vec3(vUv.x - 0.5, vUv.y - 0.5, 1.);

    vec3 p = vec3(vUv2.x*30., vUv2.y*30., 0.);
    vec3 pA = vec3(vUv.x*10., vUv.y*10., 0.);
    float result = fnoise(p); 
    result = clamp(result, 0.52, 1.);

    result = ((result - 0.52)/8.)*globalA +10./256.;

    float colAlpha = fSimpNoise(pA);
    colAlpha /= 4.;

    float a = mix(1., 0., 1.0 - (colAlpha + disA));
    a = clamp(a, 0., 1.);
    gl_FragColor = vec4(result, result, result, a);
}