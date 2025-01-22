uniform sampler2D u_map;
uniform vec3 u_color;

varying vec2 vUv;
varying vec3 v_normal;

void main() {
    vec4 color = texture2D(u_map, vUv);

    vec3 finalColor = u_color * color.rgb;
    gl_FragColor = vec4(finalColor, 1.0);
}