import { Vector3 } from 'three';
import { Modifier } from './Modifier';
import { ModifierBitFlags } from './bit-flags';

export class AccelerationModifier extends Modifier<Vector3> {
    bitFlag = ModifierBitFlags.ACCELERATION;

    defines = {
        MOD_ACCELERATION: true
    };

    constructor( value: Vector3 ) {
        super( value, 'uModAcceleration' );
    }
}