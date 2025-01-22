uniform float timeFactor;
varying vec2 vUv;

void main() {
    vUv = uv;

    vec3 pulsatingPosition = position * (sin(timeFactor * 2.0) * 0.25 + 1.25);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pulsatingPosition, 1.0);
}