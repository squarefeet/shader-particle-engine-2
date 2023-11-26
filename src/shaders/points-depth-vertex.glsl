#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform sampler2D tPosition;

// This is used for computing an equivalent of gl_FragCoord.z that is as high precision as possible.
// Some platforms compute gl_FragCoord at a lower precision which makes the manually computed value better for
// depth-based postprocessing effects. Reproduced on iPad with A10 processor / iPadOS 13.3.1.
varying vec2 vHighPrecisionZW;

void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>

	vec4 tmpPos = texture2D( tPosition, uv );

	#ifdef USE_DISPLACEMENTMAP

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>

	#endif


	// #include <begin_vertex>
	vec3 objectNormal = normalize( tmpPos.xyz - ( cameraPosition * vec3( -1.0, -1.0, -1.0 ) ) );
    vec3 transformed = vec3( tmpPos.xyz );
	float size = tmpPos.w;

    #ifdef USE_ALPHAHASH
        vPosition = vec3( tmpPos.xyz );
    #endif

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	// gl_PointSize = size / (300.0 * -mvPosition.z);
	vHighPrecisionZW = gl_Position.zw;

}
