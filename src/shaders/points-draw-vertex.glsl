#define LAMBERT
#define USE_SHADOWMAP


#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>


uniform sampler2D tPosition;
uniform sampler2D tVelocity;
uniform sampler2D tSpawn;
uniform sampler2D tDiffuse;
uniform vec2 uTime;
varying vec4 vColor;
varying vec4 vSpawn;
varying vec3 vViewPosition;
// varying vec3 vNormal;

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
    #include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>

    vec4 posTemp = texture2D( tPosition, uv );
    vec4 velTemp = texture2D( tVelocity, uv );
    vec3 pos = posTemp.xyz;
    float posSize = posTemp.w;

	#include <beginnormal_vertex>
    // objectNormal = vec3(0.0);
    // objectNormal = normalize( cameraPosition );
    // objectNormal = normalize( vec3( 0.0, 0.0, -1.0 ) );
    // objectNormal = normalize( pos );
    objectNormal = normalize( pos - ( cameraPosition * vec3( -1.0, -1.0, -1.0 ) ) );
    // objectNormal = normalize( velTemp.xyz );
    // objectNormal = normalize( vec3( 0.0, -1.0, -1.0 ) );
    // objectNormal = normalize( abs(pos) );
    // objectNormal = normalize( ( pos - cameraPosition ) );
    // objectNormal = normalize( ( pos - cameraPosition ) * vec3( 1.0, -1.0, -1.0 ) );
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>






    vec4 spawn = texture2D( tSpawn, uv );
    vSpawn = spawn;
    float age = spawn.x;
    float maxAge = spawn.y;
    float alive = spawn.z;
    float index = spawn.w;

    // vec3 startColor = vec3( 1.0 );
    // vec3 endColor = vec3(0.38, 0.03, 0.03);
    vec3 startColor = vec3( 1.0, 1.0, 1.0 );
    vec3 endColor = vec3(0.38, 0.08, 0.08);
    // vec3 endColor = vec3(1.0);
    float normalisedAge = max( age / maxAge, 0.0 );
    vec3 color = mix( startColor, endColor, normalisedAge );
    //vec3 color = mix( startColor, endColor, normalisedAge );
    //float opacity = mix( 1.0, 0.0, exponentialInOut( normalisedAge ) );

    vColor = vec4(
        color,
        1.0
        // alive * ( ( 1.0 - normalisedAge ) )
        // alive * ( normalisedAge >= 0.5 ? mix( 1.0, 0.0, ( normalisedAge - 0.5 ) * 10.0 ) : 1.0 )
    );

    // if( age == 0.0 ) {
    //     vColor.w = 0.0;
    // }

    transformed = pos.xyz;

    #include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
    // mvPosition = modelViewMatrix * vec4( pos, 1.0 );

    // vec4 mvPosition = vec4( transformed, 1.0 );
    // mvPosition = modelViewMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

    vViewPosition = -mvPosition.xyz;
    gl_PointSize = posSize * ( 300.0 / -mvPosition.z );

    #include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}
