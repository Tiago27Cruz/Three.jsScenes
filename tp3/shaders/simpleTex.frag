uniform sampler2D u_map;
uniform sampler2D frameSample;

varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(frameSample, vUv);
}