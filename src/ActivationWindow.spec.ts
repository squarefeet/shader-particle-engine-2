import {
    describe,
    beforeEach,
    afterEach,
    it,
    expect,
    vi,
} from 'vitest';
import { ActivationWindow, resetParticleCount } from './ActivationWindow';

describe( 'ActivationWindow', () => {
    afterEach( () => {
        resetParticleCount();
    } );

    describe( 'constructor', () => {
        it( 'will construct without throwing', () => {
            expect( () => new ActivationWindow( 1, 1, 1 ) ).not.toThrow();
        } );

        describe( 'spawnRate', () => {
            it( 'will assign spawnRate value', () => {
                const activationWindow = new ActivationWindow( 15, 1, 1 );
                expect( activationWindow.spawnRate ).to.equal( 15 );
            } );

            it( 'will set spawnRate to 0.01 if value is less than that', () => {
                const activationWindow = new ActivationWindow( -10, 1, 1 );
                expect( activationWindow.spawnRate ).to.equal( 0.01 );
            } );
        } );

        describe( 'burstRate', () => {
            it( 'will assign burstRate value', () => {
                const activationWindow = new ActivationWindow( 1, 12, 1 );
                expect( activationWindow.burstRate ).to.equal( 12 );
            } );

            it( 'will set burstRate to 1 if value is less than that', () => {
                const activationWindow = new ActivationWindow( 1, -1, 1 );
                expect( activationWindow.burstRate ).to.equal( 1 );
            } );
        } );

        describe( 'maxAge', () => {
            it( 'will assign maxAge value', () => {
                const activationWindow = new ActivationWindow( 1, 1, 19 );
                expect( activationWindow.maxAge ).to.equal( 19 );
            } );

            it( 'will set maxAge to 0.01 if value is less than that', () => {
                const activationWindow = new ActivationWindow( -10, 1, 0 );
                expect( activationWindow.maxAge ).to.equal( 0.01 );
            } );
        } );
    } );

    describe( 'particle count', () => {
        it( 'will calculate required particle count for positive numbers > 1', () => {
            const activationWindow = new ActivationWindow( 2, 1, 5 );

            expect( activationWindow.numParticles ).to.equal( 10 );
        } );
    } );
} );