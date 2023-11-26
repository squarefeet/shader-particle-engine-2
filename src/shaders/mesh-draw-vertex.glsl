#include <common>
// #include <fog_pars_vertex>

uniform sampler2D tPosition;
uniform sampler2D tVelocity;
uniform sampler2D tSpawn;
attribute vec2 particleUV;

varying vec4 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vVelocity;

void main() {
    vNormal = normal;

    vec3 particlePosition = texture2D( tPosition, particleUV ).xyz;
    vec4 particleSpawn = texture2D( tSpawn, particleUV );
    vec3 velocity = texture2D( tVelocity, particleUV ).xyz;

    vVelocity = velocity;

    float age = particleSpawn.x;
    float maxAge = particleSpawn.y;
    float alive = particleSpawn.z;
    float index = particleSpawn.w;

    vec3 startColor = normalize( vec3( 0.5, 0.2, 0.9 ) );
    vec3 endColor = normalize( vec3( 0.5, 0.9, 0.1 ) ) * 2.0;
    float normalisedAge = age / maxAge;
    vec3 color = mix( startColor, endColor, normalisedAge );

    vColor = vec4(
        color,
        alive * ( 1.0 - normalisedAge )
    );

    if( age == 0.0 ) {
        vColor.w = 0.0;
    }

    vec3 transformed = vec3( ( position * vColor.w ) + particlePosition );

    vPosition = vec4( modelMatrix * vec4( transformed, 1.0 ) ).xyz;

    // This was the manual way of doing what project_vertex does.
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // #include <fog_vertex>
}
