import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Camera,
    Color,
    DynamicDrawUsage,
    IUniform,
    InstancedBufferAttribute,
    InstancedMesh,
    Scene,
    ShaderMaterial,
    UniformsLib,
    Vector2,
    UniformsUtils,
} from 'three';
import { ParticleEngineCompute } from './Compute';
// import drawVertexShader from './shaders/mesh-draw-vertex.glsl?raw';
// import drawFragmentShader from './shaders/mesh-draw-fragment.glsl?raw';
import drawVertexShader from './shaders/mesh-draw-phong-vertex.glsl?raw';
import drawFragmentShader from './shaders/mesh-draw-phong-fragment.glsl?raw';

export class MeshRenderer {
    compute: ParticleEngineCompute;
    geometry: BufferGeometry;
    material: ShaderMaterial;
    mesh: InstancedMesh;
    scene?: Scene;

    uniforms: Record<string, IUniform> = UniformsUtils.merge([
        {
            tPosition: { value: null },
            tVelocity: { value: null },
            tSpawn: { value: null },
            uTime: { value: new Vector2() },

            diffuse: { value: new Color( 0xaaaaaa ) },
            emissive: { value: new Color( 0x000000 ) },
            // specular: { value: new Color( 0x2a5b1c ) },
            specular: { value: new Color( 0xffffff ) },
            shininess: { value: 100 },
            opacity: { value: 1 },
        },
        UniformsLib.lights,
    ] );

    constructor( compute: ParticleEngineCompute, geometry: BufferGeometry ) {
        this.compute = compute;
        this.geometry = geometry;
        this.material = new ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: drawVertexShader,
            fragmentShader: drawFragmentShader,
            // blending: AdditiveBlending,
            depthTest: true,
            depthWrite: true,
            transparent: true,
            vertexColors: false,
            lights: true,
        } );

        this.mesh = new InstancedMesh( this.geometry, this.material, compute.particleCount );
        this.mesh.instanceMatrix.setUsage( DynamicDrawUsage );
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
        // const positionAttr = this.compute.bufferAttributes.position as Float32Array;
        const uvAttr = this.compute.bufferAttributes.uvs as Float32Array;

        // this.geometry.setAttribute( 'position', new BufferAttribute( positionAttr, 3 ) );
        // this.geometry.setAttribute( 'uv', new BufferAttribute( uvAttr, 2 ) );

        this.mesh.geometry.attributes.particleUV = new InstancedBufferAttribute( uvAttr, 2 );
        this.mesh.geometry.attributes.particleUV.needsUpdate = true;
    }

    private updateLightsFromScene( scene: Scene, camera: Camera ) {
        this.scene = scene;
        const lights = this.scene.children.filter( d => {
            return d.isLight && d.layers.test( camera.layers );
        } );
    }

    update( deltaTime: number, runTime: number, scene?: Scene, camera?: Camera ) {
        this.uniforms.uTime.value.x = deltaTime;
        this.uniforms.uTime.value.y = runTime;
        this.updateTextureUniforms();

        if( scene && camera ) {
            this.updateLightsFromScene( scene, camera );
        }
    }
}