import './style.css';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import MetaScene from './scenes/MetaScene';
import LoadingScene from './scenes/LoadingScene';


// 1. Add ability to change scene size based on resize of the browser window
let windowInnerHeight = window.innerHeight;
let windowInnerWidth = window.innerWidth;

window.addEventListener('resize', function () {
    windowInnerHeight = window.innerHeight;
    windowInnerWidth = window.innerWidth;
    renderer.setSize(windowInnerWidth, windowInnerHeight);
    if (typeof camera !== 'undefined') {
        camera.aspect = windowInnerWidth / windowInnerHeight;
        camera.updateProjectionMatrix();
    }
});

// 2. Init Loading initial Meta Scenes

let loadingScene = new LoadingScene({
    name: "loading-scene",
    gui: false,
    background: '',
    gridFloor: false
});

let metaScene = new MetaScene({
    name: "meta-scene",
    gui: false,
    background: '',
    gridFloor: true
});

// 3. Set the current scene as Loading scene
let currentScene = loadingScene;
let scene = currentScene.scene;

// 4. Set renderer and camera and clock
let renderer = currentScene.renderer;
let camera = currentScene.camera;
let clock = new THREE.Clock();

// 5. animate function to run the scene
function animate() {
    requestAnimationFrame(animate);
    let clockDelta = clock.getDelta();
    TWEEN.update();
    currentScene.animateScene(clockDelta);
    renderer.render(currentScene.scene, camera);
}

animate();

// Set a callback for when the meta scene is ready
metaScene.setOnLoadedCallback(() => {
    currentScene = metaScene; // Switch to the meta scene
    scene = currentScene.scene;
    camera = currentScene.camera;

    // Remove the loading screen from the DOM and clean up
    let loadingScreen = document.getElementById("loadingText");
    console.log(loadingScreen);
    if (loadingScreen) {
        loadingScreen.remove(); // Remove the element from the DOM
    }
});
