import { IUniform, Vector2, Vector3, Vector4 } from "three";
import { RandomDistribution } from "./distributions/RandomDistribution";
import { BoxDistribution } from "./distributions/BoxDistribution";
import { SphereDistribution } from "./distributions/SphereDistribution";
import { Distribution } from "./distributions/Distribution";
import { TextureName } from "./constants/textures";
import { Modifiers } from "./modifiers/Modifiers";
import { Modifier } from "./modifiers/Modifier";

export interface EmitterSpawn {
    spawnRate: number;
    burstRate: number;
    maxAge: number | RandomDistribution;
}

export interface EmitterInitial<T> {
    origin: Vector3,
    distribution?: Distribution<T>
}

let ID = 0;

export class Emitter {
    id: number = ID++;
    active: boolean = true;
    
    time: number = 0;
    particleCountChanged: boolean = false;

    spawn: EmitterSpawn = {
        spawnRate: 1,
        burstRate: 1,
        maxAge: 1,
    };

    positionInitial: EmitterInitial<Vector3> = {
        origin: new Vector3( 0, 0, 0 ),
        distribution: new BoxDistribution(
            new Vector3( 5, 5, 5 ),
            new Vector3( 10, 10, 10 ),
        ),
    };
    velocityInitial: EmitterInitial<Vector3> = {
        origin: new Vector3( 0, 0, 0 ),
        distribution: new BoxDistribution(
            new Vector3( 0, 0, 0 ),
            new Vector3( 0, 0, 0 ),
        ),
    };
    velocityModifiers: Modifiers = new Modifiers();
    // activationWindow: ActivationWindow;



    uniforms: Record<string, IUniform> = {
        uActivationWindow: {
            value: new Vector2( 0, 0 ),
        },
        uEmitterIndexRange: {
            value: new Vector2( 0, 0 ),
        },
        uSpawnValue: {
            value: new Vector4( 0, 0, 0, 0 ),
        },
    };

    

    // Temporary parameters to control SimplexNoise.
    // TODO:
    //  - Move these into a Modifier.
    tempNoiseParams: Vector4 = new Vector4(
        124, // uNoiseTime
        0.05, // uNoisePositionScale // 0.001
        100.0, // uNoiseVelocityScale 
        0.0, // uNoiseTurbulance
    );

    tempNoiseScale: Vector3 = new Vector3(
        10.0,
        75.0,
        10.0,
    );

    constructor( spawnRate: number, burstRate: number, maxAge: number ) {
        this.spawnRate = spawnRate;
        this.burstRate = burstRate;
        this.maxAge = maxAge;
    }

    get spawnRate() {
        return this.uniforms.uSpawnValue.value.x;
    }
    set spawnRate( rate: number ) {
        this.uniforms.uSpawnValue.value.x = Math.max( 0.01, rate );
        this.updateParticleCount();
    }

    get burstRate() {
        return this.uniforms.uSpawnValue.value.y;
    }
    set burstRate( rate: number ) {
        this.uniforms.uSpawnValue.value.y = Math.max( 1, rate );
        this.updateParticleCount();
    }

    get maxAge() {
        return this.uniforms.uSpawnValue.value.z;
    }
    set maxAge( age: number ) {
        this.uniforms.uSpawnValue.value.z = Math.max( 0.01, age );
        this.updateParticleCount();
    }

    get particleCount() {
        return this.uniforms.uSpawnValue.value.w;
    }
    set particleCount( count: number ) {
        this.uniforms.uSpawnValue.value.w = count;
    }

    private updateParticleCount() {
        const previousParticleCount = this.particleCount;

        this.particleCount = Math.max(
            4,
            Math.ceil( this.spawnRate ) * Math.ceil( this.burstRate ) * Math.ceil( this.maxAge )
        );

        this.particleCountChanged = previousParticleCount !== this.particleCount;
    }

    get uniformsMap() {
        const velocityModifierUniforms = {
            uNoiseParams: this.tempNoiseParams,
            uNoiseScale: this.tempNoiseScale,
        };

        return {
            [ TextureName.SPAWN ]: {
                uSpawnRate: this.activationWindow.spawnRate,
                uBurstRate: this.activationWindow.burstRate,
                uMaxAge: this.activationWindow.maxAge,
                uEmitterActive: this.active,
            },
            [ TextureName.VELOCITY ]: {
                uInitialValue: this.velocityInitial.origin,
                uDistributionMin: this.velocityInitial.distribution?.min,
                uDistributionMax: this.velocityInitial.distribution?.max,
                ...velocityModifierUniforms,
            },
            [ TextureName.POSITION ]: {
                uInitialOrigin: this.positionInitial.origin,
                uDistributionMin: this.positionInitial.distribution?.min,
                uDistributionMax: this.positionInitial.distribution?.max,
            },
        };
    }

    get defines() {
        return {};
    }

    addVelocityModifier( modifier: Modifier<unknown> ) {
        this.velocityModifiers.add( modifier );
    }

    setIndexRange( startIndex: number ) {
        this.uniforms.uEmitterIndexRange.value.set(
            startIndex,
            startIndex + this.particleCount - 1
        );

        this.particleCountChanged = false;
    }

    update( deltaTime: number, totalParticleCount: number ) {
        // this.updateActivationWindow( deltaTime, totalParticleCount );
    }
}