varying vec2 vUv;
uniform sampler2D prevMap;
uniform sampler2D nextMap;
uniform float transition;
uniform vec2 resolution;

void main() {
    float vx = vUv.x;
    float vy = vUv.y;
    vec4 color = transition * texture2D(prevMap, vUv.xy) + (1.0 - transition) * texture2D(nextMap, vUv.xy);
    gl_FragColor = color;
}
