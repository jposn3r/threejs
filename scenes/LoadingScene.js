import * as THREE from 'three';

class LoadingScene {
    constructor(config) {
        this.config = config;
        this.scene = new THREE.Scene();
        this.initScene();
    }

    initScene() {
        // Initialize renderer and camera
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Set up a simple loading screen (you can customize this as needed)
        const loadingText = document.createElement('div');
        loadingText.style.position = 'absolute';
        loadingText.style.top = '50%';
        loadingText.style.left = '50%';
        loadingText.style.transform = 'translate(-50%, -50%)';
        loadingText.style.color = 'white';
        loadingText.innerHTML = 'Loading...';
        loadingText.id = 'loadingText'
        document.body.appendChild(loadingText);
    }

    animateScene(delta) {
        // Any animations specific to the loading scene
    }
}

export default LoadingScene;
