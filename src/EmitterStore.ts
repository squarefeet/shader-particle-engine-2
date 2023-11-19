import { IUniform, Vector2, Vector3, Vector4 } from 'three';
import { Emitter } from './Emitter';
import { TextureName } from './constants/textures';

export type UniformValue = (
    boolean |
    number |
    Vector2 |
    Vector3 |
    Vector4 |
    null
);

export class EmitterStore {
    store: Emitter[] = [];
    indexRanges: Vector2[] = [];
    particleCount: number = 0;
    requiredTextureSize: number = 0;
    defines: Record<TextureName, any> = {
        [ TextureName.SPAWN ]: {},
        [ TextureName.VELOCITY ]: {},
        [ TextureName.POSITION ]: {},
    };

    // uniforms: Record<TextureName, Record<string, IUniform<UniformValue[]>>> = {
    //     [ TextureName.SPAWN ]: {},
    //     [ TextureName.VELOCITY ]: {},
    //     [ TextureName.POSITION ]: {},
    // };

    uniformsSpawn: Record<string, IUniform<UniformValue[]>> = {
        uEmitterIndexRange: { value: [] },
        uActivationWindow: { value: [] },
        uEmitterActive: { value: [] },
        uSpawnValue: { value: [] },
    };

    uniformsVelocity: Record<string, IUniform<UniformValue[]>> = {
        uInitialValue: { value: [] },
        uDistributionMin: { value: [] },
        uDistributionMax: { value: [] },
        uDistributionType: { value: [] },
    };

    uniformsPosition: Record<string, IUniform<UniformValue[]>> = {    
        uInitialOrigin: { value: [] },
        uDistributionMin: { value: [] },
        uDistributionMax: { value: [] },
        uDistributionType: { value: [] },
    };

    private updateEmitterIndices() {
        let start = 0;

        this.store.forEach( emitter => {
            emitter.setIndexRange( start );
            start += emitter.particleCount;
        } );
    }

    private calculateTextureSize() {
        // For ease, ensure we're working with at least a 2x2 texture, or if
        // greater than that size, round it up to the nearest square whole number.
        // This will likely create a texture size larger than we need, so this 
        // could be optimised in the future.
        this.requiredTextureSize = Math.max(
            2,
            Math.ceil( Math.sqrt( this.particleCount ) )
        );
    }

    get hasPositionDistribution() {
        return this.store.some( d => !!d.positionInitial.distribution );
    }
    get hasVelocityDistribution() {
        return this.store.some( d => !!d.velocityInitial.distribution );
    }

    private assignModifierUniforms() {
        const hasModifiers = this.store.some( d => {
            return d.velocityModifiers.storage.length > 0;
        } );

        if( !hasModifiers ) {
            return;
        }

        const modifierUniforms = this.store.reduce( ( uniforms, emitter, emitterIndex, emitterStore ) => {
            const emitterUniforms = emitter.velocityModifiers.generateUniforms();

            Object.keys( emitterUniforms ).forEach( name => {
                uniforms[ name ] = uniforms[ name ] || { value: new Array( emitterStore.length ).fill( 0 ) };
                uniforms[ name ].value[ emitterIndex ] = emitterUniforms[ name ].value;
            } );

            return uniforms;
        }, {} as Record<string, IUniform> );

        Object.values( modifierUniforms ).forEach( ( uniform: IUniform ) => {
            const existingValue = uniform.value.find( ( d: unknown ) => !!d );
            
            uniform.value = uniform.value.map( ( d: unknown ) => {
                if( d ) {
                    return d;
                }

                switch( existingValue.constructor ) {
                    case Vector2: return new Vector2( 0, 0 );
                    case Vector3: return new Vector3( 0, 0, 0 );
                    case Vector4: return new Vector4( 0, 0, 0, 0 );
                    case Number: return 0;
                    case Boolean: return false;
                }
            } );
        } );

        this.uniformsVelocity = {
            ...this.uniformsVelocity,
            ...modifierUniforms,
        };
    }

    private assignModifierDefines() {
        const hasModifiers = this.store.some( d => {
            return d.velocityModifiers.storage.length > 0;
        } );

        if( !hasModifiers ) {
            return;
        }

        this.defines[ TextureName.VELOCITY ] = this.store.reduce( ( defines, emitter ) => {
            const emitterDefines = emitter.velocityModifiers.generateDefines();

            return {
                ...defines,
                ...emitterDefines,
            };
        }, {} as Record<string, unknown> );
    }

    add( emitter: Emitter ) {
        this.store.push( emitter );

        // Calculate the total number of particles that we absolutely need.
        this.particleCount += emitter.particleCount;

        this.updateEmitterIndices();
        this.calculateTextureSize();
        this.assignModifierUniforms();
        this.assignModifierDefines();

        // Update uniforms with references to the added emitter's particle index range and
        // activation window position.
        this.uniformsSpawn.uEmitterIndexRange.value.push( emitter.uniforms.uEmitterIndexRange.value );
        this.uniformsSpawn.uActivationWindow.value.push( emitter.uniforms.uActivationWindow.value );
        this.uniformsSpawn.uEmitterActive.value.push( emitter.active );
        this.uniformsSpawn.uSpawnValue.value.push( emitter.uniforms.uSpawnValue.value );

        this.uniformsPosition.uInitialOrigin.value.push( emitter.positionInitial.origin );
        this.uniformsVelocity.uInitialValue.value.push( emitter.velocityInitial.origin );

        // TODO:
        // - Backfill uDistributionMin and uDistributionMax if existing emitters
        //   don't have distributions
        if( this.hasPositionDistribution ) {
            const distribution = emitter.positionInitial.distribution;
            this.uniformsPosition.uDistributionMin.value.push( distribution ? distribution.min : new Vector3() );
            this.uniformsPosition.uDistributionMax.value.push( distribution ? distribution.max : new Vector3() );
            this.uniformsPosition.uDistributionType.value.push( distribution ? distribution.type : 0 );
        }
        
        if( this.hasVelocityDistribution ) {
            const distribution = emitter.velocityInitial.distribution;
            this.uniformsVelocity.uDistributionMin.value.push( distribution ? distribution.min : new Vector3() );
            this.uniformsVelocity.uDistributionMax.value.push( distribution ? distribution.max : new Vector3() );
            this.uniformsVelocity.uDistributionType.value.push( distribution ? distribution.type : 0 );
        }
    }

    remove( emitter: Emitter ) {
        this.removeAtIndex( this.store.indexOf( emitter ) );
    }

    removeAtIndex( index: number ) {
        if( index === -1 ) {
            return;
        }

        const emitter = this.store[ index ];

        this.store.splice( index, 1 );
        this.particleCount -= emitter.particleCount;

        const uniformKeys = Object.keys( this.uniformsSpawn );

        for( let i = 0; i < uniformKeys.length; ++i ) {
            this.uniformsSpawn[ uniformKeys[ i ] ].value.splice( index, 1 );
        }
    }

    update( deltaTime: number, runTime: number ): void {
        let indexRangeNeedsUpdating = false;
        let particleCountStart = 0;

        for( let i = 0, il = this.store.length; i < il; ++i ) {
            const emitter = this.store[ i ];

            if( emitter.particleCountChanged ) {
                particleCountStart = emitter.uniforms.uEmitterIndexRange.value.x;
                indexRangeNeedsUpdating = true;
            }

            if( indexRangeNeedsUpdating ) {
                emitter.setIndexRange( particleCountStart );
                particleCountStart += emitter.particleCount;
            }

            // Update emitter
            emitter.update( deltaTime, runTime, this.particleCount );

            // Update uniforms
            this.uniformsSpawn.uEmitterActive.value[ i ] = emitter.active;            
        }
    }
}