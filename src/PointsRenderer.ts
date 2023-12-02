import {
    BufferAttribute,
    BufferGeometry,
    Points,
} from 'three';
import { ParticleEngineCompute } from './Compute';
import { PointsDistanceMaterial } from './materials/PointsDistanceMaterial';
import { PointsDepthMaterial } from './materials/PointsDepthMaterial';
import { PointsMaterial } from './materials/PointsMaterial';

export class PointsRenderer {
    compute: ParticleEngineCompute;
    geometry: BufferGeometry;
    material: PointsMaterial;
    mesh: Points;

    constructor( compute: ParticleEngineCompute ) {
        this.compute = compute;
        this.geometry = new BufferGeometry();
        this.material = new PointsMaterial();

        this.mesh = new Points( this.geometry, this.material );
        // this.mesh.matrixAutoUpdate = false;
        // this.mesh.matrixWorldAutoUpdate = true;
        this.mesh.frustumCulled = false;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.mesh.customDistanceMaterial = new PointsDistanceMaterial();
        this.mesh.customDepthMaterial = new PointsDepthMaterial();

        this.updateBufferAttributes();
    }

    private updateTextureUniforms() {
        const distanceMaterial = this.mesh.customDistanceMaterial as PointsDistanceMaterial;
        const depthMaterial = this.mesh.customDepthMaterial as PointsDepthMaterial;

        distanceMaterial.updateTexture( this.compute.tPositionTexture );
        depthMaterial.updateTexture( this.compute.tPositionTexture );

        this.material.updateTextures(
            this.compute.tPositionTexture,
            this.compute.tVelocityTexture,
            this.compute.tSpawnTexture,
        );
    }

    // Call this if adding a new emitter after creating an instance of this class.
    updateBufferAttributes() {
        const positionAttr = this.compute.bufferAttributes.position as Float32Array;
        const uvAttr = this.compute.bufferAttributes.uvs as Float32Array;

        this.geometry.setAttribute( 'position', new BufferAttribute( positionAttr, 3 ) );
        this.geometry.setAttribute( 'uv', new BufferAttribute( uvAttr, 2 ) );
    }

    update( _deltaTime: number, _runTime: number ) {
        this.updateTextureUniforms();
    }
}
