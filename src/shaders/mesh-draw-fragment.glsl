// #include <fog_pars_fragment>

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vSpawn;
varying vec3 vVelocity;

// From: https://github.com/hughsk/glsl-point-light/
vec3 point_light(
    const vec3 color,
    const vec3 light_position,
    const vec3 current_position,
    const vec3 normal,
    const vec3 k
) {
    float dist = distance(light_position, current_position);
    float attenuation = 1.0 / (k.x+(k.y*dist)+(k.z*dist*dist));

    return color * attenuation * max(dot(normal, normalize(current_position - light_position)), 0.0);
}


void main() {
    if( vColor.w == 0.0 ) {
        discard;
    }
    // vec3 lightColor = normalize(abs(vPosition));
    // // vec3 lightColor = vec3( 1.0 );
    // vec3 lightDirection = normalize( vPosition + ( vVelocity * -1.0 ) );

    // vec3 lightColor2 = vec3(1.0, 0.0, 0.0 ) * 0.5;
    // vec3 lightDirection2 = normalize( vec3( -1.0, -1.0, 1.0 ) );

    // vec3 ambientLightColor = vec3( 0.05, 0.05, 0.05 );

    // vec3 norm = normalize(vNormal);

    // // Clamp values because if we have light amounts less than zero,
    // // then they'll be subtractive, and that's no good!
    // float lightAmount1 = clamp(dot(lightDirection, norm), 0.0, 1.0);
    // float lightAmount2 = clamp(dot(lightDirection2, norm), 0.0, 1.0);

    // vec3 lightValue1 = lightColor * lightAmount1 * vColor.xyz;
    // vec3 lightValue2 = lightColor2 * lightAmount2 * vColor.xyz;

    // vec3 diffuseColor = lightValue1 + lightValue2;
    // diffuseColor += ambientLightColor;

    vec3 pointLightValue1 = point_light(
        vec3( 1.0, 0.0, 0.05 ),
        vec3( 10.0, -40.0, 10.0 ),
        vPosition,
        normalize( vNormal ),
        vec3(0.1, 0.1, 0.0 )
    );

    vec3 pointLightValue2 = point_light(
        vec3( 1.0, 0.2, 0.05 ),
        vec3( -10.0, 40.0, -10.0 ),
        vPosition,
        normalize( vNormal ),
        vec3(0.1, 0.1, 0.0 )
    );

    vec3 diffuseColor = pointLightValue1 + pointLightValue2;
    // vec3 diffuseColor = vec3( 1.0 );

    // gl_FragColor = vec4(diffuseColor * vColor.w, vColor.w == 0.0 ? 0.0 : 1.0);
    gl_FragColor = vec4(diffuseColor * 5.0 * vColor.w, vColor.w );

    // #include <fog_fragment>
}