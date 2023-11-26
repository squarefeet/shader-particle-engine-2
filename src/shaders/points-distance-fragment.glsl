#define DISTANCE

uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
uniform sampler2D tPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>

void main () {
	float distanceFromCenter = distance(gl_PointCoord.xy, vec2(0.5, 0.5));
    if ( distanceFromCenter > 0.5 ) discard;

	#include <clipping_planes_fragment>

	vec4 tPositionValue = texture2D( tPosition, vUv );
	vec4 diffuseColor = vec4( 1.0, 1.0, 1.0, 1.0 );

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>

	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist ); // clamp to [ 0, 1 ]

	gl_FragColor = packDepthToRGBA( dist );
}
