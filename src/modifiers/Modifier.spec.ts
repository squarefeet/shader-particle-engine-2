import {
    describe,
    beforeEach,
    afterEach,
    it,
    expect,
    vi,
} from 'vitest';
import { Modifier } from './Modifier';

describe( 'Modifier', () => {
    class ModifierSubClass extends Modifier<number> {
        bitFlag = 1 << 1;
        
        constructor( value: number ) {
            super( value, 'uTestUniform' );
        }
    }
    
    let modifier: ModifierSubClass;

    beforeEach( () => {
        modifier = new ModifierSubClass( 10 );
    } );

    it( 'will assign value', () => {
        expect( modifier.value ).to.equal( 10 );
    } );

    it( 'will create uniform', () => {
        expect( modifier.uniforms ).to.deep.equal( { uTestUniform: { value: 10 } } );
    } );
} );