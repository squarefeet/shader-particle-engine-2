import { AdditiveBlending, BufferAttribute, BufferGeometry, IUniform, Points, ShaderMaterial, Vector2 } from 'three';
import drawVertexShader from './shaders/points-draw-vertex.glsl?raw';
import drawFragmentShader from './shaders/points-draw-fragment.glsl?raw';
import { ParticleEngineCompute } from './Compute';

export class PointsRenderer {
    compute: ParticleEngineCompute;
    geometry: BufferGeometry;
    material: ShaderMaterial;
    mesh: Points;

    uniforms: Record<string, IUniform> = {
        tPosition: { value: null },
        tVelocity: { value: null },
        tSpawn: { value: null },
        uTime: { value: new Vector2() },
        tDiffuse: { value: null },
    };

    constructor( compute: ParticleEngineCompute ) {
        this.compute = compute;
        this.geometry = new BufferGeometry();
        this.material = new ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: drawVertexShader,
            fragmentShader: drawFragmentShader,
            blending: AdditiveBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            vertexColors: false,
        } );

        this.material.extensions.drawBuffers = false;

        this.mesh = new Points( this.geometry, this.material );
        this.mesh.matrixAutoUpdate = false;
        this.mesh.frustumCulled = false;

        this.updateBufferAttributes();
    }

    private updateTextureUniforms() {
        this.uniforms.tPosition.value = this.compute.tPositionTexture;
        this.uniforms.tVelocity.value = this.compute.tVelocityTexture;
        this.uniforms.tSpawn.value = this.compute.tSpawnTexture;
    }

    // Call this if adding a new emitter after creating an instance of this class.
    updateBufferAttributes() {
        const positionAttr = this.compute.bufferAttributes.position as Float32Array;
        const uvAttr = this.compute.bufferAttributes.uvs as Float32Array;

        this.geometry.setAttribute( 'position', new BufferAttribute( positionAttr, 3 ) );
        this.geometry.setAttribute( 'uv', new BufferAttribute( uvAttr, 2 ) );
    
    }

    update( deltaTime: number, runTime: number ) {
        this.uniforms.uTime.value.x = deltaTime;
        this.uniforms.uTime.value.y = runTime;
        this.updateTextureUniforms();
    }
}