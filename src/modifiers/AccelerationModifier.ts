import { IUniform, Vector3 } from 'three';
import { Modifier } from './Modifier';

export class AccelerationModifier extends Modifier {
    defines = {
        MOD_ACCELERATION: true
    };

    uniforms: Record<string, IUniform<Vector3 | null>> = {
        uModAcceleration: { value: null }
    };

    value: Vector3;

    constructor( value: Vector3 ) {
        super();

        this.value = value;
        this.uniforms.uModAcceleration.value = this.value;
    }
}