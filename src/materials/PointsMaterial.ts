import {
    type IUniform,
    // DoubleSide,
    // NoBlending,
    ShaderMaterial,
    FrontSide,
    Vector2,
    Texture,
    UniformsLib,
    UniformsUtils,
    AdditiveBlending,
    NoBlending,
    BackSide,
} from "three";
import drawVertexShader from '../shaders/points-draw-vertex.glsl?raw';
import drawFragmentShader from '../shaders/points-draw-fragment.glsl?raw';

export class PointsMaterial extends ShaderMaterial {
    uniforms: Record<string, IUniform> = {};

    constructor() {
        const uniforms = UniformsUtils.merge( [
            {
                tPosition: { value: null },
                tVelocity: { value: null },
                tSpawn: { value: null },
                uTime: { value: new Vector2() },
                tDiffuse: { value: null },
            },
            UniformsLib.lights,
        ] );

        super( {
            uniforms: uniforms,
            vertexShader: drawVertexShader,
            fragmentShader: drawFragmentShader,
            // blending: NoBlending,
            // blending: AdditiveBlending,
            depthTest: true,
            depthWrite: true,
            transparent: false,
            vertexColors: false,
            lights: true,
            side: FrontSide,
            alphaTest: 0.5,
        } );

        this.uniforms = uniforms;
        this.extensions.drawBuffers = false;
    }

    updateTextures( tPosition: Texture, tVelocity: Texture, tSpawn: Texture ): void {
        this.uniforms.tPosition.value = tPosition;
        this.uniforms.tVelocity.value = tVelocity;
        this.uniforms.tSpawn.value = tSpawn;
    }
}
