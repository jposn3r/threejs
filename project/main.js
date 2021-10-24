import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui'

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 5000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

const gui = new dat.GUI()

// Main Scene

const scene = new THREE.Scene();

// set up renderer

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// align camera

camera.position.set( 0, 25, 90 );

// loader

const loader = new GLTFLoader();

// Load Goku Rigged resource

loader.load(
	// resource URL
	'./models/goku-rigged-animated/scene.gltf',
	// called when the resource is loaded
	function ( gltf ) {
    gltf.scene.scale.set(5,5,5);
    gltf.scene.position.x = 0;
    gltf.scene.position.y = 0;
    gltf.scene.position.z = -20;

    const mixer = new THREE.AnimationMixer( gltf.scene );
    console.log(gltf.animations)
    var action = mixer.clipAction( gltf.animations[0] );
    action.play();
		scene.add( gltf.scene );

	},
	// called while loading is progressing
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	// called when loading has errors
	function ( error ) {
		console.log( 'An error happened' );
	}
);

// Load 2018 Tesla 3 resource

loader.load(
	// resource URL
	'./models/tesla-3-2018/scene.gltf',
	// called when the resource is loaded
	function ( gltf ) {
    gltf.scene.scale.set(.025,.025,.025);
    gltf.scene.position.x = 0;
    gltf.scene.position.y = 1;
    gltf.scene.position.z = 0;
    gltf.scene.rotation.y += 180;
		scene.add( gltf.scene );
	},
	// called while loading is progressing
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	// called when loading has errors
	function ( error ) {
		console.log( 'An error happened' );
	}
);

// build and add torus rings

const geometry = new THREE.TorusGeometry(10, 0.5, 10, 100);
const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x00dadf});
const torus = new THREE.Mesh(geometry, blueMaterial);

torus.position.set(0, 20, -50);
scene.add(torus);

// build and add torus rings

const torus2 = new THREE.Mesh(geometry, blueMaterial);
const torus3 = new THREE.Mesh(geometry, blueMaterial);

torus2.position.set(0, 20, -50);
torus3.position.set(0, 20, -50);
scene.add(torus2);
scene.add(torus3);

// build and add ambient light

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// build point light to be used in light helper

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5,5,5);

// helpers

const gridHelper = new THREE.GridHelper(2000, 100, 0xffffff, 0x00dadf);
scene.add(gridHelper);

// controls to move the scene

const controls = new OrbitControls(camera, renderer.domElement);

// background star effect

function addStar() {
  const geometry = new THREE.SphereGeometry(0.1, 24, 24);
  const material = new THREE.MeshStandardMaterial({color:0xffffff});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(()=> THREE.MathUtils.randFloatSpread(100));
  star.position.set(x,y,z);
  scene.add(star);
}

Array(300).fill().forEach(addStar);

// space background texture

const spaceTexture = new THREE.TextureLoader().load('space-2.jpg');
scene.background = spaceTexture;

// avatar cube

const fuboTexture = new THREE.TextureLoader().load('fubo-bg.jpg');
// const jakeTexture = new THREE.TextureLoader().load('jake-bw.jpeg');

const fuboCube = new THREE.Mesh(
  new THREE.BoxGeometry(5,5,5),
  new THREE.MeshBasicMaterial({map:fuboTexture})
);

fuboCube.position.set(20, 10, -10);

scene.add(fuboCube);

// moon

const moonTexture = new THREE.TextureLoader().load('moon.jpeg');
const normalTexture = new THREE.TextureLoader().load('moon-normal-map.jpg');
const sphereMaterial = new THREE.MeshStandardMaterial({
  normalMap: normalTexture
})

sphereMaterial.metalness = 0.7
sphereMaterial.roughness = 0.2
sphereMaterial.color = new THREE.Color(0x292929)

const sphereGeometry = new THREE.SphereGeometry(2, 16, 16)

const moon = new THREE.Mesh(
  sphereGeometry,
  sphereMaterial
);

moon.position.set(0, 20, -50);

scene.add(moon);

// add items to gui
gui.add(moon.position, 'y');
gui.add(fuboCube.position, 'y');

// animate starts the scene by triggering requestAnimationFrame callback loop

function animate() {
  requestAnimationFrame(animate)

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  torus.rotation.z += 0.01;

  torus2.rotation.x -= 0.02;
  torus2.rotation.y -= 0.02;
  torus2.rotation.z -= 0.02;

  torus3.rotation.x -= 0.02;
  torus3.rotation.y += 0.02;
  torus3.rotation.z -= 0.02;

  fuboCube.rotation.x -= 0.005;
  fuboCube.rotation.y -= 0.005;
  fuboCube.rotation.z -= 0.005;

  // moon.rotation.x -= 0.01;
  // moon.rotation.y -= 0.01;
  // moon.rotation.z -= 0.01;

  controls.update();

  renderer.render(scene, camera);
}

animate();