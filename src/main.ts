import './style.css';
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
import { MeshRenderer } from './MeshRenderer';
import {
    BoxGeometry,
    DirectionalLight,
    HemisphereLight,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    PlaneGeometry,
    PointLight,
    SphereGeometry,
    Vector3,
    Vector4,
} from 'three';
import { SphereDistribution } from './distributions/SphereDistribution';
import { LineDistribution } from './distributions/LineDistribution';
import { AccelerationModifier } from './modifiers/AccelerationModifier';
import { SimplexNoiseModifier } from './modifiers/SimplexNoise';
import { DragModifier } from './modifiers/DragModifier';

document.body.appendChild( renderer.domElement );
document.body.appendChild( stats.dom );

const compute = new ParticleEngineCompute( renderer );

// First emitter...
// const emitter0 = new Emitter( 3, 1, 2 );
// emitter0.positionInitial.origin.set( 50, 0, 0 );
// // emitter0.addVelocityModifier( new AccelerationModifier( new Vector3( 0, -10, 0 ) ) );
// compute.addEmitter( emitter0 );

const emitter1 = new Emitter( 100000, 1, 10 );
emitter1.positionInitial.distribution = new SphereDistribution(
    new Vector3( 50, 0, 0 ),
    new Vector3( 50, 0, 0 ),
);
emitter1.addVelocityModifier( new SimplexNoiseModifier(
    new Vector4(
        124, // uNoiseTime
        0.007, // uNoisePositionScale // 0.001
        50.0, // uNoiseVelocityScale 
        0.0, // uNoiseTurbulance
    ),
    new Vector3( 1, 1, 1 ),
) );
// emitter1.addVelocityModifier( new DragModifier( 0.05 ) );
emitter1.addVelocityModifier( new AccelerationModifier( new Vector3( 0, -10, 0 ) ) );
compute.addEmitter( emitter1 );


// Second emitter...
// const emitter1 = new Emitter( 100, 1, 1 );
// emitter1.positionInitial.origin = new Vector3( 200, 0, 0 );
// emitter1.positionInitial.distribution = new SphereDistribution(
//     new Vector3( 50 ),
//     new Vector3( 50 ),
// );
// emitter1.velocityInitial.distribution = new SphereDistribution(
//     new Vector3( 100, 0, 0 ),
//     new Vector3( 100, 0, 0 ),
// );
// compute.addEmitter( emitter1 );

// compute.addDebugPlanesToScene( scene, 50 );

// Generate attributes for the MeshRenderer and PointsRenderer
compute.setPositionBufferAttribute();
compute.setUVBufferAttribute();

console.log( compute );

// Begin lighting tests
// --------------------
// These are some geometries and lights added to the scene
// to test the mesh renderer's shader
// const testSphere = new Mesh(
//     new SphereGeometry( 2 ),
//     new MeshBasicMaterial( {
//         color: 0x333333,
//     } )
// );
// testSphere.position.set( 0, 10, -10 );
// testSphere.castShadow = true;
// testSphere.receiveShadow = true;
// scene.add( testSphere );

// const pointLight = new PointLight( 0xff0000, 2, 0, 0 );
// pointLight.position.copy( testSphere.position );
// scene.add( pointLight );

// const dirLight = new DirectionalLight( 0xffffff, 2 );
// dirLight.color.setHSL( 0.1, 1, 0.95 );
// dirLight.position.set( -1, 1.75, 1 );
// dirLight.position.multiplyScalar( 30 );
// scene.add( dirLight );


// const hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 1 );
// hemiLight.color.setHSL( 0.6, 1, 0.6 );
// hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
// hemiLight.position.set( 0, 50, 0 );
// scene.add( hemiLight );
// ------------------
// End lighting tests
// ------------------



const pointsRenderer = new PointsRenderer( compute );
scene.add( pointsRenderer.mesh );

// const meshGeometry = new BoxGeometry( 10, 10, 10 );
// const meshRenderer = new MeshRenderer( compute, meshGeometry );
// scene.add( meshRenderer.mesh );


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

    camera.position.x = Math.sin( t * 0.5 ) * 1500;
    camera.position.z = Math.cos( t * 0.5 ) * 1500;

    // Move the lights around...
    // testSphere.position.y = Math.sin( t * 0.6 ) * 500;
    // pointLight.position.copy( testSphere.position );

    // dirLight.position.x = Math.sin( t ) * 100;
    // dirLight.position.z = Math.cos( t ) * 100;

    // Compute the GPGPU textures
    compute.update( dt, manualTime );

    // Update both points and mesh renderers
    pointsRenderer.update( dt, manualTime );
    // meshRenderer.update( dt, manualTime, scene, camera );

    // Render the scene
    renderer.render( scene, camera );

    ++frameNumber;
}

setTimeout( () => {
    requestAnimationFrame( tick );
}, 500 );