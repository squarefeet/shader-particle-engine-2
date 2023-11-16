import { Vector2 } from "three";

let PARTICLE_COUNT = 0;

// For unit tests only
export function resetParticleCount() {
    PARTICLE_COUNT = 0;
}

export class ActivationWindow {
    _spawnRate: number;
    _burstRate: number;
    _maxAge: number;
    indexStart: number;
    indexEnd: number;
    numParticles: number;
    time: number;
    value: Vector2;

    constructor( spawnRate: number, burstRate: number, maxAge: number ) {
        this._spawnRate = Math.max( 0.01, spawnRate );
        this._burstRate = Math.max( 1, burstRate );
        this._maxAge = Math.max( 0.01, maxAge );

        this.numParticles = Math.max(
            4,
            Math.ceil(this._spawnRate) * Math.ceil(this._burstRate) * Math.ceil(this._maxAge)
        );

        this.indexStart = PARTICLE_COUNT;
        this.indexEnd = Math.max( PARTICLE_COUNT, this.indexStart + this.numParticles - 1 );
        this.time = 0;

        this.value = new Vector2();

        PARTICLE_COUNT += this.numParticles;
    }

    get spawnRate(): number {
        return this._spawnRate;
    }
    set spawnRate( rate: number ) {
        this._spawnRate = rate;
    }

    get burstRate(): number {
        return this._burstRate;
    }
    set burstRate( rate: number ) {
        this._burstRate = rate;
    }

    get maxAge(): number {
        return this._maxAge;
    }
    set maxAge( value: number ) {
        this._maxAge = value;
    }

    get textureSize() {
        return Math.max(
            2,
            Math.ceil( Math.sqrt( this._spawnRate * this._burstRate * this._maxAge ) )
        );
    }

    update( deltaTime: number, numParticles: number ) {
        this.time += deltaTime;

        let start = Math.floor( this._spawnRate * this.time ) * this._burstRate;
        start = start % this.numParticles;

        const particlesPerTick = Math.floor( this._spawnRate * deltaTime );
        // const particlesPerTick = 0;

        let end = start + this._burstRate + particlesPerTick;
        end = end % this.numParticles;

        this.value.x = ( this.indexStart + start ) % numParticles;
        this.value.y = ( this.indexStart + end ) % numParticles;
    }
}
