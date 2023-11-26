// The EMITTER_COUNT is set by the ParticleEngineCompute's `addEmitter` method
// #define EMITTER_COUNT 1

// Common uniforms
uniform vec2 uTime;

// Compute textures are added by GPUComputationRenderer
// uniform sampler2D tSpawn;

// Control uniforms
// uniform float[ EMITTER_COUNT ] uSpawnRate;
// uniform float[ EMITTER_COUNT ] uBurstRate;
// uniform float[ EMITTER_COUNT ] uMaxAge;
uniform vec4[ EMITTER_COUNT ] uSpawnValue;
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
uniform vec2[ EMITTER_COUNT ] uEmitterIndexRange;
// uniform vec2[ EMITTER_COUNT ] uActivationWindow;


/**
 * Given an emitter start and end range (defined as `vec2(start, end)`),
 * and a particleIndex (defined as a float between 0 and total number of
 * particles from all emitters), determine whether the `particleIndex`
 * is within the `emitterIndexRange`.
 */
bool withinEmitterRange( vec2 emitterIndexRange, float particleIndex ) {
    float indexInclusiveStart = emitterIndexRange.x;
    float indexInclusiveEnd = emitterIndexRange.y;

    return (
        particleIndex >= indexInclusiveStart &&
        particleIndex <= indexInclusiveEnd
    );
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

vec2 getSpawnWindow( vec4 spawnValue, vec2 emitterIndexRange, float totalParticleCount ) {
    float deltaTime = uTime.x;
    float runTime = uTime.y;
    float spawnRate = spawnValue.x;
    float burstRate = spawnValue.y;
    // float maxAge = spawnValue.z;
    float emitterParticleCount = spawnValue.w;

    float start = floor( spawnRate * runTime ) * burstRate;
    start = mod( start, emitterParticleCount );

    float particlesPerTick = floor( spawnRate * deltaTime );
    // float particlesPerTick = 0.0;

    float end = ( start + burstRate + particlesPerTick );
    end = mod( end, emitterParticleCount );

    return vec2(
        mod( emitterIndexRange.x + start, totalParticleCount ),
        mod( emitterIndexRange.x + end, totalParticleCount )
    );
    // return spawnWindow;

    // return vec2( start, end );
}

void main() {
    // Unpack time uniform
    float deltaTime = uTime.x;
    float runTime = uTime.y;
    float totalParticleCount = resolution.x * resolution.y;

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
        vec4 spawnValue = uSpawnValue[ i ];
        vec2 emitterIndexRange = uEmitterIndexRange[ i ];

        bool isWithinEmitterRange = withinEmitterRange( emitterIndexRange, particleIndex );

        bool emitterActive = uEmitterActive[ i ];
        vec2 spawnWindow = getSpawnWindow(
            spawnValue,
            emitterIndexRange,
            totalParticleCount
        );

        // If the current particleIndex does not fall within this emitter range,
        // continue on with the loop.
        if( isWithinEmitterRange == false || emitterActive == false ) {
            continue;
        }

        bool withinWindow = withinActivationWindow( spawnWindow, particleIndex );

        // TODO:
        // Continue moving the activationWindow calculation into this shader.
        // vec2 w = getWindow( i, emitterIndexRange.y - emitterIndexRange.x );

        // TODO:
        // There's an issue with particles running over each other, removing the alive
        // check seems to fix it. But! Are there any issues with this?
        // - Yes, there's an issue with mesh renderer. It causes particles to show up at the end
        //   of their lifecycle as if they're being reborn, BUT they're at their old position.
        //   Is this an issue with the order the GPUComputationRenderer is rendering the textures?
        //
        // if( alive == 0.0 && withinActivationWindow( uActivationWindow[ i ], particleIndex ) ) {
        if( withinWindow ) {
            alive = 1.0;
            age = 0.0;

            // TODO
            // -
            // maxAge = maxAge;
        }
        else if( alive == 1.0 && age < maxAge ) {
            age += deltaTime;
        }
        else if( alive == 1.0 && age >= maxAge ) {
            alive = 0.0;
            age = 0.0;
            // maxAge = spawnValue.z;
        }
    }

    gl_FragColor = vec4( age, maxAge, alive, particleIndex );
}
