import { Vector3, Vector4 } from 'three';
import { Modifier } from './Modifier';
import { ModifierBitFlags } from './bit-flags';

export class SimplexNoiseModifier extends Modifier<Vector4 | Vector3> {
    bitFlag = ModifierBitFlags.SIMPLEX_NOISE;

    defines = {
        MOD_SIMPLEX_NOISE: true
    };

    constructor( value: Vector4, scale: Vector3 = new Vector3( 1, 1, 1 ) ) {
        super( value, 'uModNoiseParams' );

        this.uniforms.uModNoiseScale = {
            value: scale,
        };
    }

    // Helper alias
    get params(): Vector4 {
        return this.value as Vector4;
    }
    set params( v: Vector4 ) {
        this.value = v;
    }

    get scale(): Vector3 {
        return this.uniforms.uModNoiseScale.value as Vector3;
    }
    set scale( v: Vector3 ) {
        this.uniforms.uModNoiseScale.value = v;
    }

    update( deltaTime: number, runTime: number ) {
        this.params.x = runTime * 0.1;
    }
}
