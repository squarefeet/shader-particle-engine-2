import {
    describe,
    beforeEach,
    it,
    expect,
} from 'vitest';
import { Modifiers } from './Modifiers';
import { Modifier } from './Modifier';

describe( 'Modifiers', () => {
    class TestModifier1 extends Modifier<number> { bitFlag = 1 << 0; }
    class TestModifier2 extends Modifier<number> { bitFlag = 1 << 1; }
    class DuplicateBitFlagModifier extends Modifier<number> { bitFlag = 1 << 0; }

    let modifier1: TestModifier1;
    let modifier2: TestModifier2;
    let modifiers: Modifiers;

    beforeEach( () => {
        modifier1 = new TestModifier1( 2, 'uTestModifier1' );
        modifier2 = new TestModifier2( 81, 'uTestModifier2' );
        modifiers = new Modifiers();
    } );

    // The following tests access private methods, hence
    // the @ts-ignore statements.
    describe( 'bitMasking', () => {
        it( 'will initialise bit mask with 0 value', () => {
            expect( modifiers.bitMask ).to.equal( 0 );
        } );

        describe( 'setting bit flag', () => {
            it( 'will set a flag', () => {
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 1 );
                expect( modifiers.bitMask.toString( 2 ) ).to.equal( '10' );
            } );

            it( 'will set multiple flags', () => {
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 0 );
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 1 );
                expect( modifiers.bitMask.toString( 2 ) ).to.equal( '11' );
            } );

            it( 'setting the same flag more than once will not affect the mask', () => {
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 0 );
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 1 );
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 1 );
                expect( modifiers.bitMask.toString( 2 ) ).to.equal( '11' );
            } );
        } );

        describe( 'checking bit flag', () => {
            it( 'will return true if flag is set', () => {
                const flag0 = 1 << 0;
                const flag1 = 1 << 1;
                /* @ts-ignore-line */
                modifiers.setBitFlag( flag0 );
                /* @ts-ignore-line */
                modifiers.setBitFlag( flag1 );
                /* @ts-ignore-line */
                expect( modifiers.hasBitFlag( flag1 ) ).to.equal( true );
            } );

            it( 'will return false if flag is not set', () => {
                const flag = 1 << 0;
                /* @ts-ignore-line */
                expect( modifiers.hasBitFlag( flag ) ).to.equal( false );
            } );
        } );

        describe( 'clearing bit flag', () => {
            it( 'will clear a flag', () => {
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 1 );
                /* @ts-ignore-line */
                modifiers.clearBitFlag( 1 << 1 );
                expect( modifiers.bitMask.toString( 2 ) ).to.equal( '0' );
            } );

            it( 'will clear the correct flags', () => {
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 0 );
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 1 );
                /* @ts-ignore-line */
                modifiers.clearBitFlag( 1 << 0 );
                expect( modifiers.bitMask.toString( 2 ) ).to.equal( '10' );
            } );

            it( 'clearing the same flag more than once will not affect the mask', () => {
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 0 );
                /* @ts-ignore-line */
                modifiers.setBitFlag( 1 << 1 );
                /* @ts-ignore-line */
                modifiers.clearBitFlag( 1 << 1 );
                expect( modifiers.bitMask.toString( 2 ) ).to.equal( '1' );

                /* @ts-ignore-line */
                modifiers.clearBitFlag( 1 << 1 );
                expect( modifiers.bitMask.toString( 2 ) ).to.equal( '1' );
            } );
        } );
    } );

    describe( 'Modifier storage', () => {
        describe( 'adding modifier', () => {
            it( 'will add modifier to storage', () => {
                expect( modifiers.storage.length ).to.equal( 0 );
                modifiers.add( modifier1 );
                expect( modifiers.storage ).to.deep.equal( [ modifier1 ] );
            } );

            it( 'will not add modifier that already exists', () => {
                modifiers.add( modifier1 );
                modifiers.add( modifier1 );
                expect( modifiers.storage ).to.deep.equal( [ modifier1 ] );
            } );

            it( 'will add two modifiers with different constructors and different bitFlags', () => {
                modifiers.add( modifier1 );
                modifiers.add( modifier2 );
                expect( modifiers.storage ).to.deep.equal( [ modifier1, modifier2 ] );
            } );    

            it( 'will not add two modifiers of the same constructor', () => {
                modifiers.add( modifier1 );
                modifiers.add( new TestModifier1( 0, 'uTestModifier1' ) );
                expect( modifiers.storage ).to.deep.equal( [ modifier1 ] );
            } );
            
            it( 'will not add two modifiers with the same bitFlag', () => {
                modifiers.add( modifier1 );
                modifiers.add( new DuplicateBitFlagModifier( 0, 'uDuplicateModifier1' ) );
                expect( modifiers.storage ).to.deep.equal( [ modifier1 ] );
            } );

            it( 'will update the bitMask with the added modifier\'s bitFlag', () => {
                expect( modifiers.bitMask.toString( 2 ) ).to.equal( '0' );
                modifiers.add( modifier1 );
                expect( modifiers.bitMask.toString( 2 ) ).to.equal( '1' );
            } );
        } );

        describe( 'removing modifier', () => {
            it( 'will remove existing modifier', () => {
                modifiers.add( modifier1 );
                modifiers.remove( modifier1 );
                expect( modifiers.storage ).to.deep.equal( [] );
            } );

            it( 'will not remove modifier that hasn\'t been added', () => {
                expect( modifiers.storage ).to.deep.equal( [] );
                modifiers.remove( modifier1 );
                expect( modifiers.storage ).to.deep.equal( [] );
            } );

            it( 'will clear bitFlag on removal', () => {
                modifiers.add( modifier1 );
                expect( modifiers.bitMask.toString( 2 ) ).to.deep.equal( '1' );
                modifiers.remove( modifier1 );
                expect( modifiers.bitMask.toString( 2 ) ).to.deep.equal( '0' );
            } );
        } );
    } );

    describe( 'Generating Uniforms', () => {
        it( 'will generate uniforms', () => {
            modifiers.add( modifier1 );
            modifiers.add( modifier2 );
            
            const generatedUniforms = modifiers.generateUniforms();
            expect( generatedUniforms ).to.deep.equal( {
                uTestModifier1: { value: 2 },
                uTestModifier2: { value: 81 },
            } );
        } );

        it( 'will allow modifier values to be changed after uniform generation', () => {
            modifiers.add( modifier1 );
            modifiers.add( modifier2 );
            
            const generatedUniforms = modifiers.generateUniforms();

            modifier1.value = 100;

            expect( generatedUniforms ).to.deep.equal( {
                uTestModifier1: { value: 100 },
                uTestModifier2: { value: 81 },
            } );
        } );
    } );
} );