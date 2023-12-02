import { Matrix4, Mesh, MeshBasicMaterial, MeshLambertMaterial, Scene, SphereGeometry, Vector3, Vector4 } from 'three';
import { Modifier } from './Modifier';
import { ModifierBitFlags } from './bit-flags';

export class AttractorModifier extends Modifier<Matrix4> {
    bitFlag = ModifierBitFlags.ATTRACTOR;

    defines = {
        MOD_ATTRACTORS: true,
    };

    attractors: Vector4[] = [];

    constructor() {
        const matrix = new Matrix4();

        for( let i = 0; i < matrix.elements.length; ++i ) {
            matrix.elements[ i ] = 0;
        }

        super( matrix, 'uModAttractors' );
    }

    addAttractor( position: Vector3, force: number ): void {
        const attractorCount = this.attractors.length;

        if( attractorCount >= 4 ) {
            throw 'Only 4 attractors allowed';
        }

        this.attractors.push(
            new Vector4( position.x, position.y, position.z, force )
        );

        const start = attractorCount * 4;

        this.value.elements[ start + 0 ] = position.x;
        this.value.elements[ start + 1 ] = position.y;
        this.value.elements[ start + 2 ] = position.z;
        this.value.elements[ start + 3 ] = force;
    }

    removeAttractorAtIndex( index: number ): void {
        if( index > 3 ) {
            throw 'Index must be less than 4. Only 4 attractors are supported.';
        }

        const start = index * 4;
        this.value.elements[ start + 0 ] = 0;
        this.value.elements[ start + 1 ] = 0;
        this.value.elements[ start + 2 ] = 0;
        this.value.elements[ start + 3 ] = 0;
    }

    addAttractorsToScene( scene: Scene ): void {
        this.attractors.forEach( attractor => {
            const sphere = new Mesh(
                new SphereGeometry( 2 ),
                new MeshLambertMaterial( { color: 0xffffff } )
            );

            sphere.position.x = attractor.x;
            sphere.position.y = attractor.y;
            sphere.position.z = attractor.z;

            scene.add( sphere );;
        } );
    }
}
