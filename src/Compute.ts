import { DataTexture, HalfFloatType, IUniform, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Texture, Vector2, Vector3, WebGLRenderer } from "three";
import { Emitter } from "./Emitter";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/Addons.js";
import { TextureUniformName, TextureName } from "./constants/textures";
import spawnFragmentShader from './shaders/spawn-fragment.glsl?raw';
import velocityFragmentShader from './shaders/velocity-fragment.glsl?raw';
import positionFragmentShader from './shaders/position-fragment.glsl?raw';
import { Distribution } from "./distributions/Distribution";

export type ComputeDebugPlaneMesh = Mesh<PlaneGeometry, MeshBasicMaterial>;

export class ParticleEngineCompute {
    emitters: Emitter[] = [];
    textureSize: number = 1;
    force2PowerTextureSize: boolean = false;
    webGLRenderer: WebGLRenderer;
    gpuCompute!: GPUComputationRenderer;

    dataTextures: Record<TextureName, DataTexture | null> = {
        [ TextureName.POSITION ]: null,
        [ TextureName.VELOCITY ]: null,
        [ TextureName.SPAWN ]: null,
    };

    dataTextureVariables: Record<TextureName, Variable | null> = {
        [ TextureName.POSITION ]: null,
        [ TextureName.VELOCITY ]: null,
        [ TextureName.SPAWN ]: null,
    };

    bufferAttributes: Record<string, Float32Array | null> = {
        positions: null,
        uvs: null,
    };

    // Uniforms common to all compute shaders
    commonUniforms = {
        // uTime consists of vec2( deltaTime, runTime )
        uTime: new Vector2(),
        uEmitterIndexRanges: [ new Vector2() ],
        uActivationWindow: [ new Vector2() ],
    };

    debugPlanes: Record<TextureName, ComputeDebugPlaneMesh | null> = {
        [ TextureName.POSITION ]: null,
        [ TextureName.VELOCITY ]: null,
        [ TextureName.SPAWN ]: null,
    };

    constructor( webGlRenderer: WebGLRenderer ) {
        this.webGLRenderer = webGlRenderer;

        // this.initialise();
    }

    private initialise(): void {
        this.gpuCompute = new GPUComputationRenderer(
            this.textureSize,
            this.textureSize,
            this.webGLRenderer
        );

        if ( this.webGLRenderer.capabilities.isWebGL2 === false ) {
            this.gpuCompute.setDataType( HalfFloatType );
        }

        this.createDataTextures();
        this.createDataTextureVariables();
        this.setVariableDependencies();
        this.setDataTextureUniforms();
        this.gpuCompute.init();
    }

    private createDataTextures(): void {
        this.dataTextures[ TextureName.POSITION ] = this.gpuCompute.createTexture();
        this.dataTextures[ TextureName.VELOCITY ] = this.gpuCompute.createTexture();
        this.dataTextures[ TextureName.SPAWN ] = this.gpuCompute.createTexture();

        const tPosition = this.dataTextures[ TextureName.POSITION ].image.data;
        const tVelocity = this.dataTextures[ TextureName.VELOCITY ].image.data;
        const tSpawn = this.dataTextures[ TextureName.SPAWN ].image.data;

        for( let i = 0; i < tPosition.length; i += 4 ) {
            const particleIndex = i / 4;

            const applicableEmitter = this.emitters.find( emitter => {
                const start = emitter.activationWindow.indexStart;
                const end = emitter.activationWindow.indexEnd;

                return particleIndex >= start && particleIndex <= end;
            } );

            tPosition[ i + 0 ] = 0;
            tPosition[ i + 1 ] = 0;
            tPosition[ i + 2 ] = 0;
            tPosition[ i + 3 ] = 0;

            tVelocity[ i + 0 ] = 0;
            tVelocity[ i + 1 ] = 0;
            tVelocity[ i + 2 ] = 0;
            tVelocity[ i + 3 ] = 0;

            tSpawn[ i + 0 ] = 0;
            tSpawn[ i + 1 ] = applicableEmitter ? applicableEmitter.activationWindow.maxAge : 1;
            tSpawn[ i + 2 ] = 0;
            tSpawn[ i + 3 ] = particleIndex;
        }
    }

    private createDataTextureVariables(): void {
        this.dataTextureVariables[ TextureName.SPAWN ] = this.gpuCompute.addVariable(
            TextureUniformName[ TextureName.SPAWN ],
            spawnFragmentShader,
            this.dataTextures[ TextureName.SPAWN ] as DataTexture
        );

        this.dataTextureVariables[ TextureName.VELOCITY ] = this.gpuCompute.addVariable(
            TextureUniformName[ TextureName.VELOCITY ],
            velocityFragmentShader,
            this.dataTextures[ TextureName.VELOCITY ] as DataTexture
        );

        this.dataTextureVariables[ TextureName.POSITION ] = this.gpuCompute.addVariable(
            TextureUniformName[ TextureName.POSITION ],
            positionFragmentShader,
            this.dataTextures[ TextureName.POSITION ] as DataTexture
        );
    }

    private setVariableDependencies(): void {
        const position = this.dataTextureVariables[ TextureName.POSITION ] as Variable;
        const velocity = this.dataTextureVariables[ TextureName.VELOCITY ] as Variable;
        const spawn = this.dataTextureVariables[ TextureName.SPAWN ] as Variable;

        this.gpuCompute.setVariableDependencies(
            spawn,
            [ spawn ]
        );

        this.gpuCompute.setVariableDependencies(
            velocity,
            [ position, velocity, spawn ]
        );

        this.gpuCompute.setVariableDependencies(
            position,
            [ position, velocity, spawn ]
        );
    }

    private setDataTextureUniforms(): void {
        const positionUniforms = this.dataTextureVariables[ TextureName.POSITION ]?.material.uniforms as { [uniform: string]: IUniform };
        const velocityUniforms = this.dataTextureVariables[ TextureName.VELOCITY ]?.material.uniforms as { [uniform: string]: IUniform };
        const spawnUniforms = this.dataTextureVariables[ TextureName.SPAWN ]?.material.uniforms as { [uniform: string]: IUniform };

        // Assign all common uniforms.
        // The values for these common uniforms are shared across _all_
        // shaders, so a change to a component (x,y,z, etc.) of one of them
        // will change the value for all.
        // This is desirable as it saves assignment operations.
        Object.entries( this.commonUniforms ).forEach( ( [ uniformName, unifomValue ] ) => {
            positionUniforms[ uniformName ] = 
                velocityUniforms[ uniformName ] =
                    spawnUniforms[ uniformName ] = { value: unifomValue };
        } );
    }

    get particleCount(): number {
        return this.textureSize * this.textureSize;
    }

    get tPositionTexture(): Texture {
        return this.gpuCompute.getCurrentRenderTarget(
            this.dataTextureVariables[ TextureName.POSITION ] as Variable
        ).texture;
    }

    get tVelocityTexture(): Texture {
        return this.gpuCompute.getCurrentRenderTarget(
            this.dataTextureVariables[ TextureName.VELOCITY ] as Variable
        ).texture;
    }

    get tSpawnTexture(): Texture {
        return this.gpuCompute.getCurrentRenderTarget(
            this.dataTextureVariables[ TextureName.SPAWN ] as Variable
        ).texture;
    }

    setTextureSize( size: number ): void {
        let s = size;

        if( this.force2PowerTextureSize ) {
            s = Math.pow( 2, Math.ceil( Math.log( s ) / Math.log( 2 ) ) );
        }

        this.textureSize = s;
        this.initialise();
    }

    setPositionBufferAttribute(): void {
        if(
            this.bufferAttributes.position instanceof Float32Array && 
            this.particleCount * 3 === this.bufferAttributes.position.length
        ) {
            return;
        }

        this.bufferAttributes.position = new Float32Array( this.particleCount * 3 );
    }

    setUVBufferAttribute(): void {
        if(
            this.bufferAttributes.uvs instanceof Float32Array && 
            this.particleCount * 2 === this.bufferAttributes.uvs.length
        ) {
            return;
        }

        const count = this.particleCount;
        const textureSize = this.textureSize;
        const uvs = new Float32Array( count * 2 );

        for( let i = 0; i < count; ++i ) {
            const x = ( i % textureSize ) / textureSize;
            const y = ~~( i / textureSize ) / textureSize;
            const i2 = i * 2;
            
            uvs[ i2 + 0 ] = x;
            uvs[ i2 + 1 ] = y;
        }
        
        this.bufferAttributes.uvs = uvs;
    }

    getPositionDistributionUniforms(): Record<string, IUniform> {
        const hasPositionDistribution = this.emitters.some( d => {
            return d.positionInitial.distribution instanceof Distribution;
        } );

        if( !hasPositionDistribution ) {
            return {};
        }

        const uDistributionMin = [];
        const uDistributionMax = [];
        const uDistributionType = [];

        this.emitters.forEach( d => {
            let distribution = d.positionInitial.distribution;

            if( !distribution ) {
                distribution = new Distribution<Vector3>( d.positionInitial.origin, d.positionInitial.origin );
            }

            uDistributionMin.push( distribution.min );
            uDistributionMax.push( distribution.max );
            uDistributionType.push( distribution.type );
        } );

        return {
            uDistributionMin: { value: uDistributionMin },
            uDistributionMax: { value: uDistributionMax },
            uDistributionType: { value: uDistributionType },
        };
    }

    getVelocityDistributionUniforms(): Record<string, IUniform> {
        const hasVelocityDistribution = this.emitters.some( d => {
            return d.velocityInitial.distribution instanceof Distribution;
        } );

        if( !hasVelocityDistribution ) {
            return {};
        }

        const uDistributionMin = [];
        const uDistributionMax = [];
        const uDistributionType = [];

        this.emitters.forEach( d => {
            let distribution = d.velocityInitial.distribution;

            if( !distribution ) {
                distribution = new Distribution<Vector3>( d.velocityInitial.origin, d.velocityInitial.origin );
            }

            uDistributionMin.push( distribution.min );
            uDistributionMax.push( distribution.max );
            uDistributionType.push( distribution.type );
        } );

        return {
            uDistributionMin: { value: uDistributionMin },
            uDistributionMax: { value: uDistributionMax },
            uDistributionType: { value: uDistributionType },
        };
    }

    assignEmitterUniforms(): void {
         // Assign texture-specific uniforms, using the emitter's `uniforms` getter
        // as the source. This is a bit messy at the moment, so optimise this
        // in the future...
        this.emitters.forEach( emitter => {
            Object.entries( emitter.uniforms ).forEach( ( [ key, emitterUniforms ] ) => {
                const textureName = key as TextureName;
                const variable = this.dataTextureVariables[ textureName ] as Variable;
                const textureMaterialUniforms = variable.material.uniforms;

                Object.entries( emitterUniforms ).forEach( ( [ uniformName, uniformValue ] ) => {
                    let value = uniformValue;

                    // if( value instanceof Distribution ) {
                    //     value = value.getValue();
                    // }
                    if( typeof value === 'function' ) {
                        value = value();
                    }

                    textureMaterialUniforms[ uniformName ] = textureMaterialUniforms[ uniformName ] || { value: [] };
                    textureMaterialUniforms[ uniformName ].value.push( value );
                } );
            } );
        } );

        this.dataTextureVariables[ TextureName.POSITION ].material.uniforms = {
            ...this.dataTextureVariables[ TextureName.POSITION ]?.material.uniforms,
            ...this.getPositionDistributionUniforms(),
        };

        this.dataTextureVariables[ TextureName.VELOCITY ].material.uniforms = {
            ...this.dataTextureVariables[ TextureName.VELOCITY ]?.material.uniforms,
            ...this.getVelocityDistributionUniforms(),
        };

        console.log( this.dataTextureVariables[ TextureName.POSITION ]?.material.uniforms );

        // Set number of emitter #define statements so each compute shader
        // knows how many emitters it's working with.
        ( this.gpuCompute.variables as Variable[] ).forEach( v => {
            v.material.defines.EMITTER_COUNT = this.emitters.length;
        } );
    }

    // OPTIMISE
    // This needs changing. Drastically.
    // At the moment, each emitter added causes a complete
    // recalculation of all data textures :\
    addEmitter( emitter: Emitter ): void {
        this.emitters.push( emitter );

        // Calculate the total number of particles that we absolutely need.
        const totalRequiredParticles = this.emitters.reduce( ( out, e ) => {
            return out + e.activationWindow.numParticles;
        }, 0 );
        
        // For ease, ensure we're working with at least a 2x2 texture, or if
        // greater than that size, round it up to the nearest square whole number.
        // This will likely create a texture size larger than we need, so this 
        // could be optimised in the future.
        const textureSize = Math.max( 2, Math.ceil( Math.sqrt( totalRequiredParticles ) ) );

        // Re-assign common uniforms
        this.commonUniforms.uEmitterIndexRanges = this.emitters.map( emitter => {
            return new Vector2(
                emitter.activationWindow.indexStart,
                emitter.activationWindow.indexEnd,
            );
        } );

        this.commonUniforms.uActivationWindow = this.emitters.map( emitter => {
            return emitter.activationWindow.value;
        } );

        // Set texture size which will trigger a re-creation
        // of the GPUComputionRenderer and its associated
        // data textures
        this.setTextureSize( textureSize );

        // Re-create the position and UV buffer attributes
        // this.setPositionBufferAttribute();
        // this.setUVBufferAttribute();

       this.assignEmitterUniforms();
    }

    addDebugPlanesToScene( scene: Scene, size: number = 50 ): void {
        let positionX = size;

        const hasDebugPlanes = Object.values( this.debugPlanes ).every( d => d instanceof Mesh );

        if( hasDebugPlanes ) {
            return;
        }

        Object.keys( this.debugPlanes ).forEach( k => {
            const key = k as TextureName;
            const debugPlane = new Mesh(
                new PlaneGeometry( size, size ),
                new MeshBasicMaterial( {
                    color: 0x999999,
                } )
            );
            
            debugPlane.position.x = positionX;
            scene.add( debugPlane );
            
            this.debugPlanes[ key ] = debugPlane;
            positionX -= size;
        } );
    }

    removeDebugPlanes( scene: Scene ) {
        const hasDebugPlanes = Object.values( this.debugPlanes ).every( d => d instanceof Mesh );

        if( !hasDebugPlanes ) {
            return;
        }

        Object.keys( this.debugPlanes ).forEach( k => {
            const key = k as TextureName;

            scene.remove( this.debugPlanes[ key ] as Mesh );
            this.debugPlanes[ key ] = null;
        } );
    }

    update( deltaTime: number, time: number ): void {
        // Update uTime uniform (common to all compute passes)
        this.commonUniforms.uTime.x = deltaTime;
        this.commonUniforms.uTime.y = time;

        // Update all emitters
        this.emitters.forEach( ( emitter, i ) => {
            emitter.update( deltaTime, this.particleCount );

            this.dataTextureVariables[ TextureName.SPAWN ].material.uniforms.uEmitterActive.value[ i ] = emitter.active;
        } );

        // Compute all textures
        this.gpuCompute.compute();

        // Update the debug planes since the GPUComputationRenderer ping-pongs textures
        // so gotta reassign after each `compute` call.
        Object.entries( this.debugPlanes ).forEach( ( [ k, value ] ) => {
            const key = k as TextureName;

            if( value === null ) {
                return;
            }

            const variable = this.dataTextureVariables[ key ] as Variable;
            value.material.map = this.gpuCompute.getCurrentRenderTarget( variable ).texture;
        } );
    }
}