// The EMITTER_COUNT is set by the ParticleEngineCompute's `addEmitter` method
// #define EMITTER_COUNT 1

// Common uniforms
uniform vec2 uTime;

// Compute texture uniforms are added by GPUComputationRenderer
// uniform sampler2D tPosition;
// uniform sampler2D tVelocity;
// uniform sampler2D tSpawn;

uniform vec2[EMITTER_COUNT] uEmitterIndexRanges;
uniform vec3[EMITTER_COUNT] uInitialOrigin;
uniform vec3[EMITTER_COUNT] uDistributionMin;
uniform vec3[EMITTER_COUNT] uDistributionMax;
uniform int[EMITTER_COUNT] uDistributionType;

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

bool particleIsNew( float alive, float age ) {
    return alive == 1.0 && age == 0.0;
}

bool particleIsLiving( float alive, float age ) {
    return alive == 1.0 && age > 0.0;
}


// Random number generation from:
// https://www.shadertoy.com/view/ctj3Wc
uint rng_state;

uint PCGHash() {
    rng_state = rng_state * 747796405u + 2891336453u;
    uint state = rng_state;
    uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

// This function mimics Max/MSP's `scale` object.
// Can't remember where I found it, but pretty sure it
// was on the Max/MSP forums a looong time ago!
float scaleNumber( float num, float lowIn, float highIn, float lowOut, float highOut ) {
	return ( ( num - lowIn ) / ( highIn - lowIn ) ) * ( highOut - lowOut ) + lowOut;
}

vec3 scaleNumber( vec3 num, vec3 lowIn, vec3 highIn, vec3 lowOut, vec3 highOut ) {
	return ( ( num - lowIn ) / ( highIn - lowIn ) ) * ( highOut - lowOut ) + lowOut;
}

vec3 randomBoxDistribution( float seed, vec3 minSize, vec3 maxSize ) {
    rng_state = uint( seed );
    vec3 random = clamp(
        vec3( PCGHash(), PCGHash(), PCGHash() ) / float( 0xFFFFFFFFU ),
        vec3( 0.0 ),
        vec3( 1.0 )
    );

    return ( random * maxSize ) - maxSize * 0.5;
}

vec3 randomSphereDistribution( float seed, vec3 minSize, vec3 maxSize ) {
    rng_state = uint( seed );
    vec3 random = vec3(PCGHash(), PCGHash(), PCGHash()) / float(0xFFFFFFFFU);


    float u = ( random.x - 0.5 ) * 2.0;
    float t = random.y * 6.2832;
    float f = sqrt( 1.0 - ( u * u ) );

    vec3 normalisedDirection = vec3(
        f * cos( t ),
        f * sin( t ),
        u
    );

    float size = minSize.x + random.z * max( maxSize.x - minSize.x, 1.0 );

    return normalisedDirection * size;
}

vec3 randomLineDistribution( float seed, vec3 startPosition, vec3 endPosition ) {
    rng_state = uint( seed );
    vec3 random = clamp(
        vec3( PCGHash(), PCGHash(), PCGHash() ) / float( 0xFFFFFFFFU ),
        vec3( 0.0 ),
        vec3( 1.0 )
    );

    vec3 d = normalize( endPosition - startPosition );
    float length = length( endPosition - startPosition );

    return startPosition + d * random.x * length;
}

/**
 * Set a particle's initial value if it's just been born.
 */
vec3 getInitialValue( vec3 initialValue, float seed, vec3 minSize, vec3 maxSize, int distType ) {
    // NONE
    if( distType == 0 ) {
        // return initialValue;
        return vec3( 100.0 );
    }

    // RANDOM
    else if( distType == 1 ) {
        return initialValue;
    }

    // BOX
    else if( distType == 2 ) {
        return initialValue + randomBoxDistribution( seed, minSize, maxSize );
        // return vec3( 100.0 );
    }

    // SPHERE
    else if( distType == 3 ) {
        return initialValue + randomSphereDistribution( seed, minSize, maxSize );
        // return vec3( 100.0 );
    }

    // LINE
    else if( distType == 4 )  {
        return initialValue + randomLineDistribution( seed, minSize, maxSize );
    }

    return vec3( 1000.0 );
}

vec3 applyModifiers( vec3 position, vec3 velocity, vec4 spawn ) {
    // Unpack time uniform
    float deltaTime = uTime.x;
    float runTime = uTime.y;

    // Unpack spawn values
    float age = spawn.x;
    float maxAge = spawn.y;
    float alive = spawn.z;
    float particleIndex = spawn.w;

    // If particle is dead or just been born,
    // don't do anything.
    if( alive == 0.0 && age == 0.0 ) {
        return vec3( 0.0 );
    }

    // Loop through all emitters...
    for( int i = 0; i < EMITTER_COUNT; ++i ) {
        bool isWithinEmitterRange = withinEmitterRange( uEmitterIndexRanges[ i ], particleIndex );

        // If the current particleIndex does not fall within this emitter range,
        // continue on with the loop.
        if( isWithinEmitterRange == false ) {
            continue;
        }


        // Particle has just been born, so set its initial value
        if( particleIsNew( alive, age ) ) {
            float seed = gl_FragCoord.y * resolution.x + gl_FragCoord.x;
            position = getInitialValue(
                uInitialOrigin[ i ],
                seed,
                uDistributionMin[ i ],
                uDistributionMax[ i ],
                uDistributionType[ i ]
            );
        }

        // Particle is alive, so apply the relevant forces
        else if( particleIsLiving( alive, age ) ) {
            position += velocity * deltaTime;
        }

        // Dead particles have already been eliminated so no
        // need to care about them.
    }

    return position;
}

void main() {
    // Calculate the uv coords for this particle.
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionTextureValue = texture2D( tPosition, uv );
    vec4 velocityTextureValue = texture2D( tVelocity, uv );
    vec4 spawnTextureValue = texture2D( tSpawn, uv );

    // Unpack position value
    vec3 position = positionTextureValue.xyz;
    float UNUSED_POSITION_W = positionTextureValue.w;

    // Unpack velocity value
    vec3 velocity = velocityTextureValue.xyz;
    float UNUSED_VELOCITY_W = velocityTextureValue.w;

    position = applyModifiers( position, velocity, spawnTextureValue );

    gl_FragColor = vec4( position, UNUSED_POSITION_W );
}