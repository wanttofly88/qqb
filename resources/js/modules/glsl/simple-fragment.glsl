varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {
    float vx = vUv.x;
    float vy = vUv.y;
    gl_FragColor = texture2D(tDiffuse, vec2(vx, vy));
}
