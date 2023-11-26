import {
    type IUniform,
    ShaderMaterial,
    Texture,
    UniformsLib,
    UniformsUtils,
    RGBADepthPacking,
} from "three";
import depthVertexShader from '../shaders/points-depth-vertex.glsl?raw';
import depthFragmentShader from '../shaders/points-depth-fragment.glsl?raw';

export class PointsDepthMaterial extends ShaderMaterial {
    uniforms: Record<string, IUniform> = UniformsUtils.merge( [
        UniformsLib.common,
        {
            tPosition: { value: null },
            opacity: { value: 1.0 },
        },
    ] );

    defines = {
        // DEPTH_PACKING: BasicDepthPacking,
        DEPTH_PACKING: RGBADepthPacking,
        USE_UV: true,
    };

    constructor() {
        super( {
            vertexShader: depthVertexShader,
            fragmentShader: depthFragmentShader,
        } );
    }

    updateTexture( tPosition: Texture ): void {
        this.uniforms.tPosition.value = tPosition;
    }
}
