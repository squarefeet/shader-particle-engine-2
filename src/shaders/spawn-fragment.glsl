// The EMITTER_COUNT is set by the ParticleEngineCompute's `addEmitter` method
// #define EMITTER_COUNT 1

// Common uniforms
uniform vec2 uTime;

// Compute textures are added by GPUComputationRenderer
// uniform sampler2D tSpawn;

// Control uniforms
uniform float[ EMITTER_COUNT ] uSpawnRate;
uniform float[ EMITTER_COUNT ] uBurstRate;
uniform float[ EMITTER_COUNT ] uMaxAge;
uniform bool[ EMITTER_COUNT ] uEmitterActive;

/*
    This uniform array contains the index ranges for
    all emitters.
    Say you have two emitters, with 10 particles each,
    the value will be:

    [
        vec2( 0, 9 ),
        vec2( 10, 19 )
    ]
*/
uniform vec2[ EMITTER_COUNT ] uEmitterIndexRanges;
uniform vec2[ EMITTER_COUNT ] uActivationWindow;


/**
 * Given an emitter start and end range (defined as `vec2(start, end)`),
 * and a particleIndex (defined as a float between 0 and total number of
 * particles from all emitters), determine whether the `particleIndex`
 * is within the `emitterIndexRange`.
 */
bool withinEmitterRange( vec2 emitterIndexRange, float particleIndex ) {
    float indexStart = emitterIndexRange.x;
    float indexInclusiveEnd = emitterIndexRange.y;

    return (
        particleIndex >= indexStart &&
        particleIndex <= indexInclusiveEnd
    );
}

vec2 getWindow( int emitterIndex, float numParticles ) {
    float spawnRate = uSpawnRate[ emitterIndex ];
    float burstRate = uBurstRate[ emitterIndex ];
    float deltaTime = uTime.x;
    float runTime = uTime.y;


    float start = floor(spawnRate * runTime );
    start *= burstRate;
    start = mod( start, numParticles );

    float particlesPerTick = round( spawnRate * deltaTime );
    // float particlesPerTick = 0.0;

    float end = start + burstRate + particlesPerTick;
    end = mod( end, numParticles );

    return vec2( start, end );
}

bool withinActivationWindow( vec2 window, float index ) {
    float start = window.x;
    float end = window.y;

    if( start < end ) {
        return ( index >= start ) && ( index < end );
    }
    else if( start > end ) {
        return ( ( index >= start ) || ( index < end ) );
    }
}

void main() {
    // Unpack time uniform
    float deltaTime = uTime.x;
    float runTime = uTime.y;

    // Calculate the uv coords for this particle.
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Read values from the spawn texture
    vec4 spawnTextureValue = texture2D( tSpawn, uv );
    float age = spawnTextureValue.x;
    float maxAge = spawnTextureValue.y;
    float alive = spawnTextureValue.z;
    float particleIndex = spawnTextureValue.w;

    // Loop through all emitters...
    for( int i = 0; i < EMITTER_COUNT; ++i ) {
        bool isWithinEmitterRange = withinEmitterRange( uEmitterIndexRanges[ i ], particleIndex );

        // If the current particleIndex does not fall within this emitter range,
        // continue on with the loop.
        if( isWithinEmitterRange == false ) {
            continue;
        }

        // TODO:
        // Continue moving the activationWindow calculation into this shader.
        // vec2 w = getWindow( i, uEmitterIndexRanges[ i ].y - uEmitterIndexRanges[ i ].x );

        // TODO:
        // There's an issue with particles running over each other, removing the alive
        // check seems to fix it. But! Are there any issues with this?
        // - Yes, there's an issue with mesh renderer. It causes particles to show up at the end
        //   of their lifecycle as if they're being reborn, BUT they're at their old position.
        //   Is this an issue with the order the GPUComputationRenderer is rendering the textures?
        //
        // if( alive == 0.0 && withinActivationWindow( uActivationWindow[ i ], particleIndex ) ) {
        if( withinActivationWindow( uActivationWindow[ i ], particleIndex ) && uEmitterActive[ i ] ) {
            alive = 1.0;
            age = 0.0;

            // TODO
            // - 
            // maxAge = maxAge;
        }
        else if( alive == 1.0 ) {
            age += deltaTime;
        }

        if( age > maxAge ) {
            alive = 0.0;
            age = 0.0;
        }
    }

    gl_FragColor = vec4( age, maxAge, alive, particleIndex );
}