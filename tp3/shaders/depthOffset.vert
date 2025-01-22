#include <packing>
uniform sampler2D depthSample;
uniform float nearDistance;
uniform float farDistance;

varying vec2 vUv;

float getDepth(){
    float normalizedDepth = texture2D(depthSample, uv).x;
    return viewZToOrthographicDepth(perspectiveDepthToViewZ(normalizedDepth, nearDistance, farDistance), nearDistance, farDistance);
}

void main() {
    vUv = uv;
    float maxDepth = 0.1;
    float depth = clamp(getDepth(), 0.0, 1.0) * maxDepth;

    vec3 offset = normal * (maxDepth - depth);


    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + offset, 1.0); 

}