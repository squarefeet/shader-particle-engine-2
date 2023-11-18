import {
    describe,
    beforeEach,
    it,
    expect,
} from 'vitest';
import { EmitterStore } from './EmitterStore';
import { Emitter } from './Emitter';
import { Vector2 } from 'three';

describe( 'EmitterStore', () => {
    describe( 'Setting uniforms', () => {
        it( 'will allow modifier values to be changed after uniform generation', () => {
            const emitter = new Emitter( 1, 1, 1 );
            const emitterStore = new EmitterStore();

            emitterStore.add( emitter );
            
            expect( emitterStore.uniformsSpawn.uEmitterActive.value ).to.deep.equal( [ true ] );

            emitter.active = false;
            emitterStore.update( 1, 1 );
            expect( emitterStore.uniformsSpawn.uEmitterActive.value ).to.deep.equal( [ false ] );
        } );
    } );
} );