import './style.css';
import {
    ACESFilmicToneMapping,
    AmbientLight,
    CameraHelper,
    DirectionalLight,
    DirectionalLightHelper,
    HemisphereLight,
    Mesh,
    MeshLambertMaterial,
    MeshPhongMaterial,
    PCFSoftShadowMap,
    PlaneGeometry,
    PointLight,
    SphereGeometry,
    SpotLight,
    Vector3,
    Vector4,
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


document.body.appendChild( renderer.domElement );
document.body.appendChild( stats.dom );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;

const compute = new ParticleEngineCompute( renderer );

// First emitter...
const emitter1 = new Emitter( 300000, 1, 3 );
emitter1.positionInitial.origin = new Vector3( 0, 40, 0 );
emitter1.positionInitial.distribution = new SphereDistribution(
    new Vector3( 2, 2, 2 ),
    new Vector3( 2, 2, 2 ),
);
emitter1.velocityInitial.distribution = new SphereDistribution(
    new Vector3( 10, 10, 10 ),
    new Vector3( 10, 10, 10 ),
);
// emitter1.addVelocityModifier( new AccelerationModifier( new Vector3( 0, 2, 0 ) ) );
emitter1.addVelocityModifier( new SimplexNoiseModifier(
    new Vector4(
        0, // uNoiseTime
        0.2, // uNoisePositionScale // 0.001
        40, // uNoiseVelocityScale
        0.1, // uNoiseTurbulance
    ),
    new Vector3( 1, 1, 1 ),
) );

emitter1.addVelocityModifier( new DragModifier( 0.2 ) );
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

scene.add( new DirectionalLightHelper( dirLight, 10 ) );
const helper = new CameraHelper( dirLight.shadow.camera );
scene.add( helper );

const pointLight = new PointLight( 0x00ff00, 2, 500, 0.1 );
pointLight.position.set( 0, 50, 50 );
pointLight.castShadow = true;
scene.add( pointLight );

// Floor
const floor = new Mesh(
    new PlaneGeometry( 10000, 10000 ),
    new MeshPhongMaterial( { color: 0x444444, shininess: 100 } ),
);
floor.position.set( 0, -50, 0 );
floor.rotateX( -Math.PI * 0.5 );
floor.receiveShadow = true;
scene.add( floor );


const hemiLight = new HemisphereLight( 0xffffff, 0x000000, 0.1 );
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

const shadowCastingSphere = new Mesh(
    new SphereGeometry( 4 ),
    new MeshLambertMaterial( { color: 0xffffff } )
);

shadowCastingSphere.position.y = 10;
shadowCastingSphere.position.z = 50;
shadowCastingSphere.castShadow = true;
scene.add( shadowCastingSphere );


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

    controls.update( dt );

    emitter1.positionInitial.origin.set(
        Math.sin( t * 0.5 ) * 50,
        10 + Math.sin( t * 2 ) * 10,
        Math.cos( t * 0.5 ) * 50
    );

    // Compute the GPGPU textures
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
