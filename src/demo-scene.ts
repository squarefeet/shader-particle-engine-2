import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "stats.js";

// Helpers...
function onWindowResize() {
    const width = window.innerWidth,
        height = window.innerHeight,
        pixelRatio = window.devicePixelRatio,
        aspectRatio = width / height;

    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio( pixelRatio );
    renderer.setSize( width, height );
}

// Create instances of the basic bits n bobs
const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    100000
);
const scene = new Scene();
const renderer = new WebGLRenderer( {
    antialias: true,
} );
const stats = new Stats();
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Setup those bits n bobs
camera.position.y = 0;
camera.position.z = 51;
camera.lookAt( new Vector3( 0, 0, 0 ) );
stats.showPanel( 0 );

// Add a resize listener to crudely update the camera and renderer
// Note: Crudely 'cos there's no debouncing.
window.addEventListener( 'resize', onWindowResize );

// Call the resize listener to set the initial aspects and sizes of
// the camera and renderer
onWindowResize();

export {
    camera,
    scene,
    renderer,
    stats,
    controls,
};