// The EMITTER_COUNT is set by the ParticleEngineCompute's `addEmitter` method
// #define EMITTER_COUNT 1

// Common uniforms
uniform vec2 uTime;

// Compute textures are added by GPUComputationRenderer
// uniform sampler2D tVelocity;
// uniform sampler2D tSpawn;


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
uniform vec2[EMITTER_COUNT] uEmitterIndexRanges;

// The following uniforms follow the same pattern...
uniform vec3[EMITTER_COUNT] uInitialValue; // vec4( base.xyz, float distributionType )
uniform vec3[EMITTER_COUNT] uDistributionMin;
uniform vec3[EMITTER_COUNT] uDistributionMax;
uniform int[EMITTER_COUNT] uDistributionType;

/*
    Another array, this contains the values for
    each emitter's acceleration. Using the same
    set up as above, the values would be:

    [
        vec3( x0, y0, z0 ),
        vec3( x1, y1, z1 )
    ]

    If one of the emitters doesn't have acceleration
    enabled, it will just contain a zeroed-out vector.
*/
// uniform vec3[EMITTER_COUNT] uAcceleration;

/**
 * Modifiers that can have more than one entry per emitter
 * are defined as matrices. This means that these modifiers
 * can only have a maximum of 4 members.
 * 
 * mat4(
 *     vec4( 0, 0, 0, 0 ), // attractor 1
 *     vec4( 0, 0, 0, 0 ), // attractor 2
 *     vec4( 0, 0, 0, 0 ), // attractor 3
 *     vec4( 0, 0, 0, 0 ), // attractor 4
 * );
 */
// uniform mat4[EMITTER_COUNT] uAttractors;

uniform vec4[EMITTER_COUNT] uNoiseParams;
uniform vec3[EMITTER_COUNT] uNoiseScale;



vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip) {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;

    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

    return p;
}

#define F4 0.309016994374947451

vec4 simplexNoiseDerivatives (vec4 v) {
    const vec4  C = vec4( 0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);

    vec4 i  = floor(v + dot(v, vec4(F4)) );
    vec4 x0 = v -   i + dot(i, C.xxxx);

    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;

    i = mod289(i);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
                i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
            + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
            + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));


    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

    vec3 values0 = vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)); //value of contributions from each corner at point
    vec2 values1 = vec2(dot(p3, x3), dot(p4, x4));

    vec3 m0 = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0); //(0.5 - x^2) where x is the distance
    vec2 m1 = max(0.5 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);

    vec3 temp0 = -6.0 * m0 * m0 * values0;
    vec2 temp1 = -6.0 * m1 * m1 * values1;

    vec3 mmm0 = m0 * m0 * m0;
    vec2 mmm1 = m1 * m1 * m1;

    float dx = temp0[0] * x0.x + temp0[1] * x1.x + temp0[2] * x2.x + temp1[0] * x3.x + temp1[1] * x4.x + mmm0[0] * p0.x + mmm0[1] * p1.x + mmm0[2] * p2.x + mmm1[0] * p3.x + mmm1[1] * p4.x;
    float dy = temp0[0] * x0.y + temp0[1] * x1.y + temp0[2] * x2.y + temp1[0] * x3.y + temp1[1] * x4.y + mmm0[0] * p0.y + mmm0[1] * p1.y + mmm0[2] * p2.y + mmm1[0] * p3.y + mmm1[1] * p4.y;
    float dz = temp0[0] * x0.z + temp0[1] * x1.z + temp0[2] * x2.z + temp1[0] * x3.z + temp1[1] * x4.z + mmm0[0] * p0.z + mmm0[1] * p1.z + mmm0[2] * p2.z + mmm1[0] * p3.z + mmm1[1] * p4.z;
    float dw = temp0[0] * x0.w + temp0[1] * x1.w + temp0[2] * x2.w + temp1[0] * x3.w + temp1[1] * x4.w + mmm0[0] * p0.w + mmm0[1] * p1.w + mmm0[2] * p2.w + mmm1[0] * p3.w + mmm1[1] * p4.w;

    return vec4(dx, dy, dz, dw) * 49.0;
}

#define OCTAVES 2


vec3 calculateNoiseVelocity( vec3 currentPosition, vec4 uNoiseParamsValue, vec3 uNoiseScaleValue ) {
    float uNoiseTime = uNoiseParamsValue.x;
    float uNoisePositionScale = uNoiseParamsValue.y;
    vec3 uNoiseVelocityScale = uNoiseScaleValue; // uNoiseParamsValue.z
    float uNoiseTurbulance = uNoiseParamsValue.w;

    vec3 noisePosition = currentPosition * uNoisePositionScale;
    float noiseTime = uNoiseTime;

    vec4 xNoisePotentialDerivatives = vec4(0.0);
    vec4 yNoisePotentialDerivatives = vec4(0.0);
    vec4 zNoisePotentialDerivatives = vec4(0.0);

    vec3 yDerivativeAdjustment = normalize( vec3(123.4, 129845.6, -1239.1) );
    // vec3 yDerivativeAdjustment = vec3(0.0, 1.0, 0.0);
    vec3 zDerivativeAdjustment = normalize( vec3(-9519.0, 9051.0, -123.0) );
    // vec3 zDerivativeAdjustment = vec3(0.0, 0.0, 1.0 );

    for (int i = 0; i < OCTAVES; ++i) {
        float octaveValue = pow( 2.0, float( i ) );
        float scale = (1.0 / 2.0) * octaveValue;

        float noiseScale = pow(uNoiseTurbulance, float(i));

        // fix undefined behaviour
        if( uNoiseTurbulance == 0.0 && i == 0 ) {
            noiseScale = 1.0;
        }

        float scaleMultiplier = noiseScale * scale;

        xNoisePotentialDerivatives += simplexNoiseDerivatives(
            vec4(noisePosition * octaveValue, noiseTime)
        ) * scaleMultiplier;

        yNoisePotentialDerivatives += simplexNoiseDerivatives(
            vec4((noisePosition + yDerivativeAdjustment) * octaveValue, noiseTime)
        ) * scaleMultiplier;

        zNoisePotentialDerivatives += simplexNoiseDerivatives(
            vec4((noisePosition + zDerivativeAdjustment) * octaveValue, noiseTime)
        ) * scaleMultiplier;
    }

    //compute curl
    vec3 noiseVelocity = vec3(
        zNoisePotentialDerivatives[1] - yNoisePotentialDerivatives[2],
        xNoisePotentialDerivatives[2] - zNoisePotentialDerivatives[0],
        yNoisePotentialDerivatives[0] - xNoisePotentialDerivatives[1]
    );

    return normalize( noiseVelocity ) * uNoiseVelocityScale;
}






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

vec3 randomBoxDistribution( float seed, vec3 minSize, vec3 maxSize ) {
    rng_state = uint( seed );
    vec3 random = clamp(
        vec3( PCGHash(), PCGHash(), PCGHash() ) / float( 0xFFFFFFFFU ),
        vec3( 0.0 ),
        vec3( 1.0 )
    );

    return ( random * maxSize ) - maxSize * 0.5;
}

vec3 randomSphereDistribution( float seed, vec3 minSize, vec3 maxSize, vec3 initialValue, vec3 position ) {
    rng_state = uint( seed );
    vec3 random = vec3(PCGHash(), PCGHash(), PCGHash()) / float(0xFFFFFFFFU) * 2.0 - 1.0;

    vec3 direction = normalize( position - random ) * maxSize.x;

    return direction;

    // float u = ( random.x - 0.5 ) * 2.0;
    // float t = random.y * 6.2832;
    // float f = sqrt( 1.0 - ( u * u ) );

    // vec3 normalisedDirection = vec3(
    //     f * cos( t ),
    //     f * sin( t ),
    //     u
    // );

    // float size = minSize.x + random.z * max( maxSize.x - minSize.x, 1.0 );

    // return normalisedDirection * size;
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
vec3 getInitialValue(
    vec3 initialValue,
    float seed,
    vec3 minSize,
    vec3 maxSize,
    int distType,
    vec3 position
) {
    // NONE
    if( distType == 0 ) {
        // return initialValue;
        return vec3( 0.0 );
    }

    // RANDOM
    else if( distType == 1 ) {
        return initialValue;
    }

    // BOX
    else if( distType == 2 ) {
        return initialValue + randomBoxDistribution( seed, minSize, maxSize );
    }

    // SPHERE
    else if( distType == 3 ) {
        return initialValue + randomSphereDistribution( seed, minSize, maxSize, initialValue, position );
    }

    // LINE
    else if( distType == 4 )  {
        return initialValue + randomLineDistribution( seed, minSize, maxSize );
    }

    return vec3( 1000.0 );
}

/**
 * Applies all velocity-modifying forces.
 * Determines what forces to apply to what particles by
 * checking whether the current particle is within
 * the emitter range before doing anything.
 */
vec3 applyModifiers( vec3 velocity, vec4 spawn, vec3 position ) {
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
            velocity = getInitialValue(
                uInitialValue[ i ],
                seed,
                uDistributionMin[ i ],
                uDistributionMax[ i ],
                uDistributionType[ i ],
                position
            );
        }

        // Particle is alive, so apply the relevant forces
        else if( particleIsLiving( alive, age ) ) {
            // velocity += uAcceleration[ i ] * deltaTime;
            // velocity *= ( 1.0 - uDrag[ i ] );
            // velocity *= 0.97;

            velocity += calculateNoiseVelocity( position, uNoiseParams[ i ], uNoiseScale[ i ] ) * deltaTime;
            velocity.y -= 1.0;
            // velocity = min( vec3( 10.0 ), velocity );

            // velocity += vec3( 0.0, 0.0, 20.0 ) * deltaTime;
            // velocity = calculateNoiseVelocity( position );

            // if( position.x + velocity.x > 1000.0 ) {
            //     velocity.x *= -1.0;
            // }
            // else if( position.x + velocity.x < -1000.0 ) {
            //     velocity.x *= -1.0;
            // }
        }
        else {
            velocity = vec3( 0.0 );
        }

        // Dead particles have already been eliminated so no
        // need to care about them.
    }

    return velocity;
}


void main() {
    // Calculate the uv coords for this particle.
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Get the current particle's velocity and mass values
    // from the velocity texture
    vec4 velocityTextureValue = texture2D( tVelocity, uv ); // vec4( vec3(velocity), float mass )
    vec3 velocity = velocityTextureValue.xyz;
    float mass = velocityTextureValue.w;

    vec4 positionTextureValue = texture2D( tPosition, uv );

    // Get the current particle's spawn values from the
    // spawn texture.
    vec4 spawnTextureValue = texture2D( tSpawn, uv ); // vec4( float age, float maxAge, float alive, float particleIndex )

    // Apply any relevant forces to the particle.
    velocity = applyModifiers( velocity, spawnTextureValue, positionTextureValue.xyz );

    // Write the new velocity value back to the texture.
    gl_FragColor = vec4( velocity, mass );
}