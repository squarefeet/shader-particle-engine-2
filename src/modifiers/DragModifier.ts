import { Modifier } from './Modifier';

export class DragModifier extends Modifier<number> {
    bitFlag = 1 << 1;

    defines = {
        MOD_DRAG: true
    };

    uniformName: string = 'uModDrag';
}