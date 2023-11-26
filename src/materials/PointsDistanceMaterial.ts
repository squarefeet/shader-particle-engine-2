import {
    type IUniform,
    ShaderMaterial,
    Vector3,
    Texture,
    UniformsUtils,
    UniformsLib,
} from "three";
import distanceVertexShader from '../shaders/points-distance-vertex.glsl?raw';
import distanceFragmentShader from '../shaders/points-distance-fragment.glsl?raw';

export class PointsDistanceMaterial extends ShaderMaterial {
    uniforms: Record<string, IUniform> = UniformsUtils.merge( [
        {
            referencePosition: { value: new Vector3( 0, 0, 0 ) },
            tPosition: { value: null },
            nearDistance: { value: 1 },
            farDistance: { value: 1000 },
        },
        UniformsLib.common,
        UniformsLib.displacementmap,
    ] );

    isMeshDistanceMaterial: boolean = true;

    constructor() {
        super( {
            vertexShader: distanceVertexShader,
            fragmentShader: distanceFragmentShader,
            depthTest: true,
            depthWrite: true,
        } );
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
