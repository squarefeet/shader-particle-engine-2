// #include <common>
// #include <packing>
// #include <fog_pars_fragment>
// #include <bsdfs>
// #include <lights_pars_begin>
// #include <logdepthbuf_pars_fragment>
// #include <shadowmap_pars_fragment>
// #include <shadowmask_pars_fragment>

// varying vec4 vColor;

// void main() {
//     vec3 outgoingLight = vColor.xyz;

//     #include <shadowmap_fragment>

//     outgoingLight *= shadowMask;

//     gl_FragColor = vColor;
// }


#define LAMBERT
#define USE_COLOR_ALPHA
#define USE_SHADOWMAP

// uniform vec3 diffuse;
// uniform vec3 emissive;
// uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
// varying vec4 vColor;
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform sampler2D tDiffuse;
varying vec4 vSpawn;

void main() {
    if( vSpawn.x == 0.0 || vSpawn.z == 0.0 ) discard;

    // Draw circles
    float distanceFromCenter = distance(gl_PointCoord.xy, vec2(0.5, 0.5));
    if (distanceFromCenter > 0.5) discard;

    float alpha = clamp(1.0 - distanceFromCenter * 2.0, 0.0, 1.0);


    vec3 diffuse = vec3( vColor.xyz );
    // float opacity = clamp(1.0 - distanceFromCenter * 2.0, 0.0, 1.0);
    float opacity = 1.0;
    vec3 emissive = vec3( 0.0 );


	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>

	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

	gl_FragColor.w = vColor.w;
}
