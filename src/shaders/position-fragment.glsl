// The EMITTER_COUNT is set by the ParticleEngineCompute's `addEmitter` method
// #define EMITTER_COUNT 1

// Common uniforms
uniform vec2 uTime;
uniform float cameraNear;
uniform float cameraFar;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uInvProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uInvModelViewMatrix;
uniform mat4 uInvViewMatrix;
uniform vec2 uScreenResolution;
uniform sampler2D tDepth;
uniform sampler2D tNormal;


#include <packing>
float readDepth( vec2 coord ) {
    float fragCoordZ = texture2D( tDepth, coord ).x;
    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
    // return viewZ;
}
 // Transform a worldspace coordinate to a clipspace coordinate
vec4 worldToClip( vec3 v, mat4 mvpMatrix ) {
    return mvpMatrix * vec4( v, 1.0 );
}

// Transform a clipspace coordinate to a screenspace one.
vec3 clipToScreen( vec4 v ) {
    return vec3( v.x, v.y, v.z ) / ( v.w );
}

// Transform a screenspace coordinate to a 2d vector for
// use as a texture UV lookup.
vec2 screenToUV( vec2 v ) {
    return vec2( v.xy ) * 0.5 + vec2(0.5);
}

vec3 worldToScreen( vec3 v ) {
    vec4 clip = worldToClip( v, uProjectionMatrix * uModelViewMatrix );
    return clipToScreen( clip );
}

vec2 worldToUV( vec3 v ) {
    return screenToUV( worldToScreen( v ).xy );
}

vec3 worldPosFromDepth( vec2 uv, float depth ) {
    float z = depth * 2.0 - 1.0;
    // float z = depth;

    vec4 clipSpacePosition = vec4( uv * 2.0 - 1.0, z, 1.0 );
    // vec4 clipSpacePosition = vec4( uv, z, 1.0 );
    vec4 viewSpacePosition = uInvProjectionMatrix * clipSpacePosition;

    // Perspective division
    viewSpacePosition /= viewSpacePosition.w;

    vec4 worldSpacePosition = uInvViewMatrix * viewSpacePosition;

    return worldSpacePosition.xyz;
}

vec3 worldPos( vec2 uv ) {
    float depth = readDepth( uv );
    return worldPosFromDepth( uv, depth );
}

// naive way of computing the normal
// Adapted from: https://www.shadertoy.com/view/fsVczR
// Via: https://atyuwen.github.io/posts/normal-reconstruction/
vec3 computeNormalNaive( vec2 coord ) {
    vec2 uvUnit = vec2( 1.0 ) / uScreenResolution;

    vec3 l1 = worldPos( coord - vec2( uvUnit.x, 0.0 ) );
    vec3 r1 = worldPos( coord + vec2( uvUnit.x, 0.0 ) );
    vec3 t1 = worldPos( coord + vec2( 0.0, uvUnit.y ) );
    vec3 b1 = worldPos( coord - vec2( 0.0, uvUnit.y ) );

    vec3 dpdx = r1 - l1;
    vec3 dpdy = t1 - b1;

    return normalize( cross( dpdx, dpdy ) );
}

// Adapted from: https://www.shadertoy.com/view/fsVczR
// Via: https://atyuwen.github.io/posts/normal-reconstruction/
vec3 computeNormalImproved( vec2 uv ) {
    vec2 uvUnit = vec2( 1.0 ) / uScreenResolution;

    float c0Depth = readDepth( uv );
    float l2Depth = readDepth( uv - vec2( uvUnit.x * 2.0, 0.0 ) );
    float l1Depth = readDepth( uv - vec2( uvUnit.x * 1.0, 0.0 ) );
    float r1Depth = readDepth( uv + vec2( uvUnit.x * 1.0, 0.0 ) );
    float r2Depth = readDepth( uv + vec2( uvUnit.x * 2.0, 0.0 ) );
    float b2Depth = readDepth( uv - vec2( 0.0, uvUnit.y * 2.0 ) );
    float b1Depth = readDepth( uv - vec2( 0.0, uvUnit.y * 1.0 ) );
    float t1Depth = readDepth( uv + vec2( 0.0, uvUnit.y * 1.0 ) );
    float t2Depth = readDepth( uv + vec2( 0.0, uvUnit.y * 2.0 ) );

    float dl = abs( l1Depth * l2Depth / ( 2.0 * l2Depth - l1Depth ) - c0Depth );
    float dr = abs( r1Depth * r2Depth / ( 2.0 * r2Depth - r1Depth ) - c0Depth );
    float db = abs( b1Depth * b2Depth / ( 2.0 * b2Depth - b1Depth ) - c0Depth );
    float dt = abs( t1Depth * t2Depth / ( 2.0 * t2Depth - t1Depth ) - c0Depth );

    vec3 ce = worldPosFromDepth( uv, c0Depth );

    vec3 dpdx = ( dl < dr ) ?
        ce - worldPosFromDepth( uv - vec2( uvUnit.x, 0.0 ), l1Depth ) :
        -ce + worldPosFromDepth( uv + vec2( uvUnit.x, 0.0 ), r1Depth );

    vec3 dpdy = ( db < dt ) ?
        ce - worldPosFromDepth( uv - vec2( 0, uvUnit.y ), b1Depth ) :
        -ce + worldPosFromDepth( uv + vec2( 0, uvUnit.y ), t1Depth );

    return normalize( cross( dpdx, dpdy ) );
}


// Compute texture uniforms are added by GPUComputationRenderer
// uniform sampler2D tPosition;
// uniform sampler2D tVelocity;
// uniform sampler2D tSpawn;

uniform vec2[EMITTER_COUNT] uEmitterIndexRange;
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
    // RANDOM
    if( distType == 1 ) {
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

    return initialValue;
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
        bool isWithinEmitterRange = withinEmitterRange( uEmitterIndexRange[ i ], particleIndex );

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

            // position = vec3(0.0);
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

// https://github.com/d3/d3-interpolate/blob/main/src/basis.js
float bezierInterpolationBasis( float t1, float v0, float v1, float v2, float v3 ) {
    float t2 = t1 * t1;
    float t3 = t2 * t1;

    return (
        (1.0 - 3.0 * t1 + 3.0 * t2 - t3) * v0
        + (4.0 - 6.0 * t2 + 3.0 * t3) * v1
        + (1.0 + 3.0 * t1 + 3.0 * t2 - 3.0 * t3) * v2
        + t3 * v3
    ) / 6.0;
}

float bezierInterpolation( float t, float values[ 7 ] ) {
    int n = 7;
    int i = 0;

    if( t <= 0.0 ) {
        i = 0;
        t = 0.0;
    }
    else if( t >= 1.0 ) {
        t = 1.0;
        i = n - 1;
    }
    else {
        i = int( t * float( n ) );
    }

    float v1 = values[ i ];
    float v2 = values[ i + 1 ];
    float v0 = i > 0 ? values[ i - 1 ] : 2.0 * v1 - v2;
    float v3 = i < n - 1 ? values[ i + 2 ] : 2.0 * v2 - v1;

    return bezierInterpolationBasis(
        ( t - float( i ) / float( n ) ) * float( n ),
        v0, v1, v2, v3
    );
}

void main() {
    // Calculate the uv coords for this particle.
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionTextureValue = texture2D( tPosition, uv );
    vec4 velocityTextureValue = texture2D( tVelocity, uv );
    vec4 spawnTextureValue = texture2D( tSpawn, uv );

    // Unpack position value
    vec3 position = positionTextureValue.xyz;

    // Unpack spawn value
    float age = spawnTextureValue.x;
    float maxAge = spawnTextureValue.y;
    float alive = spawnTextureValue.z;
    float normalisedAge = clamp( age / maxAge, 0.0, 1.0 );

    float sizeSteps[7] = float[7]( 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 );

    // float size = mix( startSize, endSize, steppedAge );
    float size = bezierInterpolation( normalisedAge, sizeSteps );
    // float size = 0.0 + (1.0 - normalisedAge);
    // float size = length( velocityTextureValue.xyz );
    // float size = 1.0;

    // Calculate size
    // float size = 1000.0 * (1.0 - normalisedAge);
    // float size = 2.0 * ( 1.0 - normalisedAge );
    // float size = 2.0;


    // Unpack velocity value
    vec3 velocity = velocityTextureValue.xyz;

    position = applyModifiers( position, velocity, spawnTextureValue );

    // vec3 collisionSpherePos = vec3( 0.0, 5.0, 0.0 );
    // float collisionSphereRadius = 5.0;

    // // vec3 dPos = collisionSpherePos - ( position + velocity * uTime.x );
    // vec3 dPos = collisionSpherePos - position;
    // float distanceToCollisionSphere = length( dPos );

    // if( abs( distanceToCollisionSphere ) <= collisionSphereRadius ) {
    //     position = positionTextureValue.xyz;
    // }

    mat4 mvpMatrix = uProjectionMatrix * uModelViewMatrix;

    vec4 particleClipSpace = worldToClip( position, mvpMatrix );
    vec2 particleDepthUV = worldToUV( position );

    // 0 is cameraNear, 1 is cameraFar
    float sceneDepthAtPosition = readDepth( particleDepthUV );

    // 0 is cameraNear, -1 is cameraFar
    float particleDepth = -viewZToOrthographicDepth( particleClipSpace.z, cameraNear, cameraFar );
    float dist = sceneDepthAtPosition - particleDepth;
    float depthUnit = 1.0 / (cameraFar - cameraNear);

    size = 1.0;

    if( dist < depthUnit * 10.0 ) {
        vec3 particleNormal = normalize( ( mvpMatrix * texture2D( tNormal, particleDepthUV ) ).xyz );
        // vec3 particleNormal = computeNormalImproved( particleDepthUV );
        // vec3 cameraPositionNormalised = normalize( cameraPosition );

        // vec3 vel = reflect( velocityTextureValue.xyz, particleNormal );
        // vec3 vel = reflect( particleNormal, vec3( 0.0, 0.0, 1.0 ) );
        // vec3 vel = cross( cameraPositionNormalised, particleNormal );

        rng_state = uint( particleDepthUV );
        vec3 randomVel = vec3( PCGHash(), PCGHash(), PCGHash() ) / float( 0xFFFFFFFFU );

        vec3 vel = reflect( velocityTextureValue.xyz, particleNormal );
        vel += randomVel * 5.0;

        // position = positionTextureValue.xyz + ( vel * 0.016 );
        // position = positionTextureValue.xyz + ( ( vel * uTime.x ) );
        // position = positionTextureValue.xyz + ( ( vel * 0.016 ) );
        position = positionTextureValue.xyz;

        // position -= velocity * uTime.x;
        // position = positionTextureValue.xyz + ( particleNormal * 0.016 );


        // vec2 eps = vec2(1.0) / uScreenResolution;

        // vec2 proj_tc1 = particleDepthUV + vec2(eps.x, 0.0);
        // vec2 proj_tc2 = particleDepthUV + vec2(0.0, eps.y);

        // vec3 p0 = worldPos(particleDepthUV);
        // vec3 p1 = worldPos(proj_tc1);
        // vec3 p2 = worldPos(proj_tc2);

        // // vec3 n = mat3(uInvModelViewMatrix) * normalize(cross(p1.xyz - p0.xyz, p2.xyz - p0.xyz));
        // vec3 n = computeNormalImproved( particleDepthUV );
        // vec3 r = reflect(velocityTextureValue.xyz, n);

        // position += n * 1e-4;
        // vec3 velocity = r * 0.3 + cos( position * 1e5 ) * 5e-4;
        // // vel += inverseVel * 0.5;

        // position += velocity * -1.0;
    }

    gl_FragColor = vec4(
        position.xy,
        position.z,
        // sceneDepthAtPosition,
        // particleDepth,
        size * alive
    );
}
