#define PHONG

varying vec3 vViewPosition;

uniform sampler2D tPosition;
uniform sampler2D tVelocity;
uniform sampler2D tSpawn;
attribute vec2 particleUV;
varying vec4 vSpawn;

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

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
    // vec3 transformed = vec3( position );

    vec3 particlePosition = texture2D( tPosition, particleUV ).xyz;
    vec4 particleSpawn = texture2D( tSpawn, particleUV );

    vSpawn = particleSpawn;

    float age = particleSpawn.x;
    float maxAge = particleSpawn.y;
    float alive = particleSpawn.z;
    float index = particleSpawn.w;
    float normalisedAge = age / maxAge;
    float invertedNormalisedAge = 1.0 - normalisedAge;

    // transformed = transformed * invertedNormalisedAge;
    transformed = vec3( transformed + particlePosition );

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>


	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
