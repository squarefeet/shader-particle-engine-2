// uniform sampler2D tPosition;
// varying vec4 vWorldPosition;

// void main() {
//     vec4 tmpPos = texture2D( tPosition, position.xy );

//     vec4 worldPosition = modelMatrix * vec4( tmpPos.xyz, 1.0 );
//     vec4 mvPosition = viewMatrix * worldPosition;

//     gl_PointSize = tmpPos.w / length( mvPosition.xyz );

//     vWorldPosition = worldPosition;

//     gl_Position = projectionMatrix * mvPosition;

// }


#define DISTANCE
#define USE_UV

#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform sampler2D tPosition;
varying vec3 vWorldPosition;

void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>

	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif

	// #include <begin_vertex>
    vec4 tmpPos = texture2D( tPosition, uv );
    vec3 transformed = vec3( tmpPos.xyz );
	float size = tmpPos.w;

    #ifdef USE_ALPHAHASH
        vPosition = vec3( tmpPos.xyz );
    #endif


	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>

	// gl_PointSize = size * ( 300.0 / -mvPosition.z );
	// gl_PointSize = size * ( 300.0 );
	// gl_PointSize = 1.0 * ( 300.0 / -mvPosition.z );
	gl_PointSize = size;

	vWorldPosition = worldPosition.xyz;
}
