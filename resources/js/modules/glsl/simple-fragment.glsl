varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D prevMap;

void main() {
    float vx = vUv.x;
    float vy = vUv.y;
    gl_FragColor = texture2D(prevMap, vec2(vx, vy));
}
