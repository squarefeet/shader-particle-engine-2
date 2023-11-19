import { Vector2, Vector4 } from "three";

let PARTICLE_COUNT = 0;

// For unit tests only
export function resetParticleCount() {
    PARTICLE_COUNT = 0;
}

export class ActivationWindow {
    indexStart: number;
    indexEnd: number;
    indexRange: Vector2;
    numParticles: number;
    time: number;
    value: Vector2;
    spawnValue: Vector4 = new Vector4();

    constructor( spawnRate: number, burstRate: number, maxAge: number ) {
        this.time = 0;
        this.spawnValue.x = Math.max( 0.01, spawnRate );
        this.spawnValue.y = Math.max( 1, burstRate );
        this.spawnValue.z = Math.max( 0.01, maxAge );
        this.spawnValue.w = 0;

        this.numParticles = Math.max(
            4,
            Math.ceil( this.spawnRate ) * Math.ceil( this.burstRate ) * Math.ceil( this.maxAge )
        );

        const indexStart = PARTICLE_COUNT;
        const indexEnd = Math.max( PARTICLE_COUNT, indexStart + this.numParticles - 1 );
        
        this.indexRange = new Vector2( indexStart, indexEnd );
        this.value = new Vector2();

        PARTICLE_COUNT += this.numParticles;
    }

    get spawnRate(): number {
        return this.spawnValue.x;
    }
    set spawnRate( rate: number ) {
        this.spawnValue.x = rate;
    }

    get burstRate(): number {
        return this.spawnValue.y;
    }
    set burstRate( rate: number ) {
        this.spawnValue.y = rate;
    }

    get maxAge(): number {
        return this.spawnValue.z;
    }
    set maxAge( value: number ) {
        this.spawnValue.z = value;
    }

    // deprecated
    get textureSize() {
        return Math.max(
            2,
            Math.ceil( Math.sqrt( this.spawnRate * this.burstRate * this.maxAge ) )
        );
    }

    update( deltaTime: number, numParticles: number ) {
        this.time += deltaTime;

        let start = Math.floor( this.spawnRate * this.time ) * this.burstRate;
        start = start % this.numParticles;

        const particlesPerTick = Math.floor( this.spawnRate * deltaTime );
        // const particlesPerTick = 0;

        let end = start + this.burstRate + particlesPerTick;
        end = end % this.numParticles;

        this.value.x = ( this.indexStart + start ) % numParticles;
        this.value.y = ( this.indexStart + end ) % numParticles;
    }
}
