import './style.css';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import MetaScene from './scenes/MetaScene';
import LoadingScene from './scenes/LoadingScene';
import SceneController from './helpers/SceneController';

let windowInnerHeight = window.innerHeight;
let windowInnerWidth = window.innerWidth;
let loadingComplete = false;

window.addEventListener('resize', function () {
    windowInnerHeight = window.innerHeight;
    windowInnerWidth = window.innerWidth;
    renderer.setSize(windowInnerWidth, windowInnerHeight);
    if (typeof camera !== 'undefined') {
        camera.aspect = windowInnerWidth / windowInnerHeight;
        camera.updateProjectionMatrix();
    }
});

const sceneController = new SceneController();

let loadingScene = new LoadingScene({
    name: "loading-scene", 
    gui: false,
    background: '',
    gridFloor: false,
    sceneController: sceneController
});

let metaScene = new MetaScene({
    name: "meta-scene",
    gui: false,
    background: '',
    gridFloor: true,
    sceneController: sceneController
});

let currentScene = loadingScene;
let scene = currentScene.scene;
let renderer = currentScene.renderer;
let camera = currentScene.camera;

let clock = new THREE.Clock();

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
