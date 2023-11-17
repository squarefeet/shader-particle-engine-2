import { Vector3 } from 'three';
import { Modifier } from './Modifier';

export class AccelerationModifier extends Modifier<Vector3> {
    bitFlag = 1 << 0;

    defines = {
        MOD_ACCELERATION: true
    };

    constructor( value: Vector3 ) {
        super( value, 'uModAcceleration' );
    }
}