uniform sampler2D u_map;
uniform sampler2D u_normal;
uniform sampler2D u_alpha;
uniform sampler2D u_emissive;
uniform sampler2D u_specular;
uniform vec3 u_color;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(u_map, vUv);
    vec4 normal = texture2D(u_normal, vUv);
    vec4 alpha = texture2D(u_alpha, vUv);
    vec4 emissive = texture2D(u_emissive, vUv);
    vec4 specular = texture2D(u_specular, vUv);

    vec3 finalColor = u_color * (specular.rgb + color.rgb*0.4);
    gl_FragColor = vec4(finalColor, alpha.a);
}