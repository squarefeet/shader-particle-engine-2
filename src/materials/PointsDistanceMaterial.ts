import {
    DoubleSide,
    type IUniform,
    NoBlending,
    ShaderMaterial,
    Vector3,
    Texture,
    UniformsUtils,
    UniformsLib,
    AdditiveBlending,
} from "three";
import distanceVertexShader from '../shaders/points-distance-vertex.glsl?raw';
import distanceFragmentShader from '../shaders/points-distance-fragment.glsl?raw';

export class PointsDistanceMaterial extends ShaderMaterial {
    uniforms: Record<string, IUniform> = {};
    isMeshDistanceMaterial: boolean = true;

    constructor() {
        const uniforms = UniformsUtils.merge( [
            {
                referencePosition: { value: new Vector3( 0, 0, 0 ) },
                tPosition: { value: null },
                nearDistance: { value: 1 },
                farDistance: { value: 1000 },
            },
            UniformsLib.common,
            UniformsLib.displacementmap,
        ] );

        super( {
            uniforms: uniforms,
            vertexShader: distanceVertexShader,
            fragmentShader: distanceFragmentShader,
            depthTest: true,
            depthWrite: true,
            // blendAlpha: AdditiveBlending,
            // transparent: true,
            // side: DoubleSide,
            // blending: NoBlending,
            alphaTest: 0.5,
        } );

        this.uniforms = uniforms;
    }

    get nearDistance(): number {
        return this.uniforms.nearDistance.value;
    }
    set nearDistance( dist: number ) {
        this.uniforms.nearDistance.value = dist;
    }

    get farDistance(): number {
        return this.uniforms.farDistance.value;
    }
    set farDistance( dist: number ) {
        this.uniforms.farDistance.value = dist;
    }

    updateTexture( tPosition: Texture ): void {
        this.uniforms.tPosition.value = tPosition;
    }
}
