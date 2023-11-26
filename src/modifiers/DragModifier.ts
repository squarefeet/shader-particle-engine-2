import { Modifier } from './Modifier';
import { ModifierBitFlags } from './bit-flags';

export class DragModifier extends Modifier<number> {
    bitFlag = ModifierBitFlags.DRAG;

    defines = {
        MOD_DRAG: true
    };

    constructor( value: number ) {
        super( value, 'uModDrag' );
    }
}