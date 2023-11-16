import { Vector3, Vector4 } from "three";
import { RandomDistribution } from "./distributions/RandomDistribution";
import { BoxDistribution } from "./distributions/BoxDistribution";
import { SphereDistribution } from "./distributions/SphereDistribution";
import { Distribution } from "./distributions/Distribution";
import { ActivationWindow } from "./ActivationWindow";
import { TextureName } from "./constants/textures";
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
        distribution: new SphereDistribution(
            new Vector3( 0, 0, 0 ),
            new Vector3( 0, 0, 0 ),
        ),
    };
    velocityModifiers: Modifier[] = [];
    activationWindow: ActivationWindow;

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
        this.activationWindow = new ActivationWindow( spawnRate, burstRate, maxAge );
    }

    get uniforms() {
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

    addVelocityModifier( modifier: Modifier ) {
        this.velocityModifiers.push( modifier );
    }

    update( deltaTime: number, numParticles: number ) {
        this.activationWindow.update( deltaTime, numParticles );
    }
}