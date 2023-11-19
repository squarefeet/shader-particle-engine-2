uniform sampler2D tPosition;
uniform sampler2D tSpawn;
uniform vec2 uTime;
varying vec4 vColor;

// https://github.com/glslify/glsl-easings/blob/master/exponential-in-out.glsl
float exponentialInOut(float t) {
    if( t == 0.0 || t == 1.0 ) {
        return t;
    }

    float t20 = 20.0 * t;

    if( t < 0.5 ) {
        return 0.5 * pow( 2.0, t20 - 10.0 );
    }

    return -0.5 * pow( 2.0, 10.0 - t20 ) + 1.0;
}

void main() {
    vec4 posTemp = texture2D( tPosition, uv );
    vec3 pos = posTemp.xyz;
    float posSize = posTemp.w;
    
    vec4 spawn = texture2D( tSpawn, uv );
    float age = spawn.x;
    float maxAge = spawn.y;
    float alive = spawn.z;
    float index = spawn.w;

    vec3 startColor = normalize( vec3( 0.25, 0.4, 0.75 ) ) * 0.5;
    vec3 endColor = normalize( vec3( 0.7, 0.4, 0.50 ) ) * 2.0;
    float normalisedAge = max( age / maxAge, 0.0 );
    vec3 color = mix( startColor, endColor, exponentialInOut( normalisedAge ) );
    //vec3 color = mix( startColor, endColor, normalisedAge );
    //float opacity = mix( 1.0, 0.0, exponentialInOut( normalisedAge ) );
                    
    vColor = vec4(
        color,
        alive * ( ( 1.0 - normalisedAge ) )
        // alive
    );

    if( age == 0.0 ) {
        vColor.w = 0.0;
    }

    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

    float size = 3.0 * ( 1.0 - normalisedAge );
    // float size = 30.0 + (500.0 * normalisedAge);

    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
}