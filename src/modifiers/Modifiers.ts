import { IUniform } from 'three';
import { Modifier } from './Modifier';

export class Modifiers {
    storage: Modifier<unknown>[] = [];
    bitMask: number = 0;

    private hasBitFlag( bitFlag: number ) {
        return ( this.bitMask & bitFlag ) !== 0;
    }

    private setBitFlag( bitFlag: number ) {
        this.bitMask |= bitFlag;
    }

    private clearBitFlag( bitFlag: number ) {
        this.bitMask &= ~bitFlag;
    }

    // Checks whether the given modifier already exists
    // in the `storage` array, or whether a modifier
    // of that type has already been added.
    has( modifier: Modifier<unknown> ) {
        return (
            this.storage.indexOf( modifier ) > -1 ||
            this.storage.find( d => d.constructor === modifier.constructor ) ||
            this.hasBitFlag( modifier.bitFlag )
        );
    }

    add( modifier: Modifier<unknown> ) {
        if( this.has( modifier ) ) {
            console.info( 'Already has modifier:', modifier.constructor.name );
            return;
        }

        this.storage.push( modifier );
        this.setBitFlag( modifier.bitFlag );
    }

    remove( modifier: Modifier<unknown> ) {
        const index = this.storage.indexOf( modifier );

        if( index === -1 ) {
            return;
        }

        this.storage.splice( index, 1 );
        this.clearBitFlag( modifier.bitFlag );
    }

    generateDefines() {
        return this.storage.reduce( ( defines, modifier ) => {
            Object.entries( modifier.defines ).forEach( ( [ defineName, defineValue ] ) => {
                defines[ defineName ] = defineValue;
            } );

            return defines;
        }, {} as Record<string, unknown> );
    }

    generateUniforms() {
        return this.storage.reduce( ( uniforms, modifier ) => {
            Object.entries( modifier.uniforms ).forEach( ( [ uniformName, value ] ) => {
                uniforms[ uniformName ] = value;
            } );

            return uniforms;
        }, {} as Record<string, IUniform>);
    }
    
    update( deltaTime: number, runTime: number ) {
        for( let i = 0, il = this.storage.length; i < il; ++i ) {
            this.storage[ i ].update( deltaTime, runTime );
        }
    }
}