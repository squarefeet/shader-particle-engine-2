import './style.css';
import {
    ACESFilmicToneMapping,
    AmbientLight,
    BoxGeometry,
    CameraHelper,
    DepthFormat,
    DepthTexture,
    DirectionalLight,
    DirectionalLightHelper,
    HalfFloatType,
    HemisphereLight,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshNormalMaterial,
    MeshPhongMaterial,
    NearestFilter,
    PCFSoftShadowMap,
    PlaneGeometry,
    PointLight,
    ShaderMaterial,
    SphereGeometry,
    SpotLight,
    UnsignedByteType,
    UnsignedInt248Type,
    Vector2,
    Vector3,
    Vector4,
    WebGLRenderTarget,
} from 'three';
import {
    camera,
    scene,
    renderer,
    stats,
    controls,
} from './demo-scene';
import { Emitter } from './Emitter';
import { ParticleEngineCompute } from './Compute';
import { PointsRenderer } from './PointsRenderer';
import { SphereDistribution } from './distributions/SphereDistribution';
import { SimplexNoiseModifier } from './modifiers/SimplexNoise';
import { DragModifier } from './modifiers/DragModifier';
import { AttractorModifier } from './modifiers/AttractorModifier';
import { AccelerationModifier } from './modifiers/AccelerationModifier';
import { BoxDistribution } from './distributions/BoxDistribution';


document.body.appendChild( renderer.domElement );
document.body.appendChild( stats.dom );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;

const compute = new ParticleEngineCompute( renderer );

// First emitter...
const emitter1 = new Emitter( 1000, 1, 10 );
emitter1.positionInitial.origin = new Vector3( 0, 20, 0 );
emitter1.positionInitial.distribution = new BoxDistribution(
    new Vector3( 10, 0, 10 ),
    new Vector3( 10, 0, 10 ),
);
emitter1.velocityInitial.distribution = new BoxDistribution(
    new Vector3( 0, 0, 0 ),
    new Vector3( 0, 0, 0 ),
);
emitter1.addVelocityModifier( new AccelerationModifier( new Vector3( 0, -5, 0 ) ) );
// emitter1.addVelocityModifier( new SimplexNoiseModifier(
//     new Vector4(
//         0, // uNoiseTime
//         0.1, // uNoisePositionScale // 0.001
//         1, // uNoiseVelocityScale
//         0.0, // uNoiseTurbulance
//     ),
//     new Vector3( 1, 1, 1 ),
// ) );

const attractorModifier = new AttractorModifier();
attractorModifier.addAttractor( new Vector3( 0, 20, 0 ), 100 );
attractorModifier.addAttractor( new Vector3( 20, 10, 0 ), 150 );
attractorModifier.addAttractor( new Vector3( 0, 30, 20 ), 150 );
attractorModifier.addAttractor( new Vector3( 0, 10, 20 ), 150 );
// attractorModifier.addAttractorsToScene( scene );
// emitter1.addVelocityModifier( attractorModifier );

emitter1.addVelocityModifier( new DragModifier( 0.0 ) );
compute.addEmitter( emitter1 );

// compute.addDebugPlanesToScene( scene, 50 );

// Generate attributes for the MeshRenderer and PointsRenderer
compute.setPositionBufferAttribute();
compute.setUVBufferAttribute();

console.log( compute );

// Begin lighting tests
// --------------------
const dirLight = new DirectionalLight( 0xffffff, 2 );
dirLight.castShadow = true;
dirLight.shadow.camera.left =
dirLight.shadow.camera.bottom = -100;
dirLight.shadow.camera.right =
dirLight.shadow.camera.top = 100;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 250;
dirLight.position.set( 0, 100, 0 );
scene.add( dirLight );

// scene.add( new DirectionalLightHelper( dirLight, 10 ) );
// const helper = new CameraHelper( dirLight.shadow.camera );
// scene.add( helper );

const pointLight = new PointLight( 0x00ff00, 2, 500, 0.1 );
pointLight.position.set( 0, 50, 50 );
pointLight.castShadow = true;
scene.add( pointLight );

// Floor
const floor = new Mesh(
    new PlaneGeometry( 10000, 10000 ),
    // new MeshPhongMaterial( { color: 0x444444, shininess: 100 } ),
    new MeshNormalMaterial(),
);
floor.position.set( 0, -50, 0 );
floor.rotateX( -Math.PI * 0.5 );
floor.receiveShadow = true;
scene.add( floor );


const hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 1 );
hemiLight.position.set( 0, 1, 0 );
scene.add( hemiLight );

const ambientLight = new AmbientLight( 0x220455, 0.1 );
scene.add( ambientLight );

const spotlight = new SpotLight( 0xffffff, 3, 250, 0.6, 0.5, 0 );
spotlight.position.set( 50, 100, 0 );
spotlight.lookAt( scene.position );
spotlight.castShadow = true;
spotlight.shadow.camera.near = 1;
spotlight.shadow.camera.far = 250;
spotlight.shadow.camera.fov = 50;
// scene.add( spotlight );
// ------------------
// End lighting tests
// ------------------

const pointsRenderer = new PointsRenderer( compute );
scene.add( pointsRenderer.mesh );
console.log( pointsRenderer );

// // const meshGeometry = new BoxGeometry( 1, 1, 1 );
// const meshGeometry = new SphereGeometry( 2, 6, 6 );
// const meshRenderer = new MeshRenderer( compute, meshGeometry );
// scene.add( meshRenderer.mesh );





// Effect Composer
// ---------------
// const renderScene = new RenderPass( scene, camera );

// // const bokehPass = new BokehPass( scene, camera, {
// //     focus: 1.0,
// //     aperture: 0.025,
// //     maxblur: 0.01
// // } );

// const taaRenderPass = new TAARenderPass( scene, camera );
// taaRenderPass.sampleLevel = 3;
// taaRenderPass.clearColor = 0x000000;
// taaRenderPass.clearAlpha = 1;
// // taaRenderPass.accumulate = true;
// // taaRenderPass.unbiased = false;

// const bloomPass = new UnrealBloomPass(
//     new Vector2( window.innerWidth * 2, window.innerHeight * 2 ),
//     0.25, // strength
//     0.1, // radius
//     0.1 // threshold
// );

// const outputPass = new OutputPass();

// const composer = new EffectComposer( renderer );
// composer.addPass( renderScene );
// // composer.addPass( bokehPass );
// composer.addPass( taaRenderPass );
// composer.addPass( bloomPass );
// composer.addPass( outputPass );

const colliderBox = new Mesh(
    new SphereGeometry( 10 ),
    // new MeshBasicMaterial( { color: 0xffffff } )
    new MeshNormalMaterial(),
);
colliderBox.receiveShadow = true;
colliderBox.castShadow = true;
scene.add( colliderBox );


//
// Depth texture
//
const depthPostMaterial = new ShaderMaterial( {
    depthTest: true,
    depthWrite: false,
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        #include <packing>

        varying vec2 vUv;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;


        float readDepth( sampler2D depthSampler, vec2 coord ) {
            float fragCoordZ = texture2D( depthSampler, coord ).x;
            float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }

        void main() {
            float depth = readDepth( tDepth, vUv );

            gl_FragColor.rgb = 1.0 - vec3( depth );
            gl_FragColor.a = 1.0;
        }
    `,
    uniforms: {
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far },
        tDepth: { value: null }
    }
} );

const normalPostMaterial = new ShaderMaterial( {
    depthTest: true,
    depthWrite: true,
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        #include <packing>

        varying vec2 vUv;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform vec2 screenResolution;
        uniform mat4 uInvProjectionMatrix;
        uniform mat4 uInvViewMatrix;


        float readDepth( vec2 coord ) {
            float fragCoordZ = texture2D( tDepth, coord ).x;
            float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }

        vec3 worldPosFromDepth( vec2 uv, float depth ) {
            float z = depth * 2.0 - 1.0;

            vec4 clipSpacePosition = vec4( uv * 2.0 - 1.0, z, 1.0 );
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
        vec3 computeNormalNaive( vec2 coord ) {
            vec2 uvUnit = vec2( 1.0 ) / screenResolution;

            vec3 l1 = worldPos( coord - vec2( uvUnit.x, 0.0 ) );
            vec3 r1 = worldPos( coord + vec2( uvUnit.x, 0.0 ) );
            vec3 t1 = worldPos( coord + vec2( 0.0, uvUnit.y ) );
            vec3 b1 = worldPos( coord - vec2( 0.0, uvUnit.y ) );

            vec3 dpdx = r1 - l1;
            vec3 dpdy = t1 - b1;

            return normalize( cross( dpdx, dpdy ) );

            // vec3 l1 = getPos( p - ivec2(1,0), texelFetch( depth,p-ivec2(1,0),0).w);
            // vec3 r1 = getPos(p+ivec2(1,0),texelFetch(depth,p+ivec2(1,0),0).w);
            // vec3 t1 = getPos(p+ivec2(0,1),texelFetch(depth,p+ivec2(0,1),0).w);
            // vec3 b1 = getPos(p-ivec2(0,1),texelFetch(depth,p-ivec2(0,1),0).w);
            // vec3 dpdx = r1-l1;
            // vec3 dpdy = t1-b1;
            // return normalize(cross(dpdx,dpdy));
        }

        vec3 computeNormalImproved( vec2 uv ) {
            vec2 uvUnit = vec2( 1.0 ) / screenResolution;

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


        void main() {
            // vec3 col = computeNormalNaive( vUv );
            vec3 col = computeNormalImproved( vUv );

            gl_FragColor.rgb = vec3( col.r, col.g, col.b );
            gl_FragColor.a = 1.0;
        }
    `,
    uniforms: {
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far },
        tDepth: { value: null },
        screenResolution: { value: new Vector2() },
        uInvProjectionMatrix: { value: new Matrix4() },
        uInvViewMatrix: { value: new Matrix4() },
    },
} );

const normalPostMaterial2 = new ShaderMaterial( {
    depthTest: true,
    depthWrite: true,
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDepth;
        uniform vec2 resolution;

        void main() {
            gl_FragColor.rgb = texture2D( tDepth, vUv ).xyz;
            gl_FragColor.a = 1.0;
        }
    `,
    uniforms: {
        tDepth: { value: null },
        resolution: { value: new Vector2() },
    },
} );
const postPlane = new PlaneGeometry( window.innerWidth * 0.05, window.innerHeight * 0.05 );
// const postQuad = new Mesh( postPlane, depthPostMaterial );
const postQuad = new Mesh( postPlane, normalPostMaterial2 );
postQuad.position.set( 50, 0, 0 );
scene.add( postQuad );

const depthTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight );
depthTarget.texture.minFilter = NearestFilter;
depthTarget.texture.magFilter = NearestFilter;
depthTarget.stencilBuffer = false;
depthTarget.depthTexture = new DepthTexture( window.innerWidth, window.innerHeight );
depthTarget.depthTexture.format = DepthFormat;
depthTarget.depthTexture.type = UnsignedByteType;

const normalRenderTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight );
normalRenderTarget.texture.minFilter = NearestFilter;
normalRenderTarget.texture.magFilter = NearestFilter;
normalRenderTarget.texture.type = HalfFloatType;
const normalRenderTargetMaterial = new MeshNormalMaterial();






let previousTime = 0;
let manualTime = 0;
let frameNumber = 0;

function tick( time: DOMHighResTimeStamp ) {
    stats.update();
    requestAnimationFrame( tick );

    const t = time * 0.001;
    const dt = ( t - previousTime );
    previousTime = t;
    manualTime += dt;

    scene.remove( pointsRenderer.mesh );
    scene.remove( postQuad );
    renderer.setRenderTarget( depthTarget );
    renderer.render( scene, camera );
    normalPostMaterial.uniforms.tDepth.value = depthTarget.depthTexture;
    normalPostMaterial.uniforms.screenResolution.value.set( window.innerWidth, window.innerHeight );
    normalPostMaterial.uniforms.uInvProjectionMatrix.value = camera.projectionMatrixInverse;
    normalPostMaterial.uniforms.uInvViewMatrix.value = camera.matrixWorldInverse;
    renderer.setRenderTarget( null );


    const overrideMaterial_old = scene.overrideMaterial;
    renderer.setRenderTarget( normalRenderTarget );
    scene.overrideMaterial = normalRenderTargetMaterial;
    normalPostMaterial2.uniforms.resolution.value.set( window.innerWidth, window.innerHeight );
    renderer.render( scene, camera );
    scene.overrideMaterial = overrideMaterial_old;
    renderer.setRenderTarget( null );

    normalPostMaterial2.uniforms.tDepth.value = normalRenderTarget.texture;
    // normalPostMaterial2.uniforms.tDepth.value = depthTarget.depthTexture;

    scene.add( pointsRenderer.mesh );
    scene.add( postQuad );

    // middleOfScreenBox.quaternion.copy( camera.quaternion );
    // middleOfScreenBox.position.copy( camera.position ).multiplyScalar( 0.9 );


    // colliderBox.position.x = Math.sin( t * 0.5 ) * 15;

    // controls.update( dt );

    // emitter1.positionInitial.origin.set(
    //     Math.sin( t * 0.5 ) * 50,
    //     10 + Math.sin( t * 2 ) * 10,
    //     Math.cos( t * 0.5 ) * 50
    // );

    // camera.updateWorldMatrix( true, true );
    // pointsRenderer.mesh.updateMatrixWorld();

    // Compute the GPGPU textures
    compute.commonUniforms.tDepth.value = depthTarget.depthTexture;
    compute.commonUniforms.tNormal.value = normalRenderTarget.texture;
    compute.commonUniforms.cameraNear.value = camera.near;
    compute.commonUniforms.cameraFar.value = camera.far;
    compute.commonUniforms.cameraPosition.value = camera.position;
    compute.commonUniforms.uProjectionMatrix.value = camera.projectionMatrix;
    compute.commonUniforms.uInvProjectionMatrix.value = camera.projectionMatrixInverse;
    compute.commonUniforms.uScreenResolution.value.set( window.innerWidth, window.innerHeight );
    compute.commonUniforms.uModelViewMatrix.value = pointsRenderer.mesh.modelViewMatrix;
    compute.commonUniforms.uInvModelViewMatrix.value = pointsRenderer.mesh.modelViewMatrix.clone().invert();
    compute.commonUniforms.uInvViewMatrix.value = camera.matrixWorldInverse;
    compute.commonUniforms.uNormalMatrix.value = camera.normalMatrix;
    // compute.commonUniforms.uNormalMatrix.value = pointsRenderer.mesh.normalMatrix;

    compute.dataTextureVariables.position!.material.uniformsNeedUpdate = true;
    compute.dataTextureVariables.velocity!.material.uniformsNeedUpdate = true;
    compute.dataTextureVariables.spawn!.material.uniformsNeedUpdate = true;

    compute.update( dt, manualTime );

    // Update both points and mesh renderers
    pointsRenderer.update( dt, manualTime );
    // meshRenderer.update( dt, manualTime, scene, camera );

    // Render the scene
    renderer.render( scene, camera );
    // composer.render( dt );

    ++frameNumber;
}

setTimeout( () => {
    requestAnimationFrame( tick );
}, 500 );
