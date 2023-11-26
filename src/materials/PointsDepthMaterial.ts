import {
    type IUniform,
    ShaderMaterial,
    Texture,
    BasicDepthPacking,
    UniformsLib,
    UniformsUtils,
    RGBADepthPacking,
    DoubleSide,
    NoBlending,
    AdditiveBlending,
} from "three";
import depthVertexShader from '../shaders/points-depth-vertex.glsl?raw';
import depthFragmentShader from '../shaders/points-depth-fragment.glsl?raw';

export class PointsDepthMaterial extends ShaderMaterial {
    uniforms: Record<string, IUniform> = {};

    constructor() {
        const uniforms: Record<string, IUniform> = UniformsUtils.merge( [
            UniformsLib.common,
            {
                tPosition: { value: null },
                opacity: { value: 1.0 },
            },
        ] );

        super( {
            defines: {
                // DEPTH_PACKING: BasicDepthPacking,
                DEPTH_PACKING: RGBADepthPacking,
                USE_UV: true,
            },
            uniforms: uniforms,
            vertexShader: depthVertexShader,
            fragmentShader: depthFragmentShader,
            // depthTest: true,
            // depthWrite: true,
            // side: DoubleSide,
            // blending: AdditiveBlending,
            // alphaTest: 0.5,
        } );

        this.uniforms = uniforms;
        console.log( this );
    }

    updateTexture( tPosition: Texture ): void {
        this.uniforms.tPosition.value = tPosition;
    }
}
