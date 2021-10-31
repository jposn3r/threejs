import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshPhongMaterial } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

// document event listeners

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('mousedown', onDocumentMouseDown, false);

// renderer

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#world'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// camera 

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 5000);
camera.name = "camera-1";
updateCameraPosition([0, 12, 73], 50, 1)

// gui

const gui = new dat.GUI();

// main scene

const scene = new THREE.Scene();

// animation mixers array - https://www.mixamo.com - for more animations and models

let mixers = [];

let gokuResourceUrl = './models/goku-rigged-animated/scene.gltf'
loadGLTF(gokuResourceUrl, 'goku', 5, {x: 5, y: 0, z: 20}, true)

let snakeEyesResourceUrl = './models/snake_eyes__fortnite_item_shop_skin/scene.gltf'
loadGLTF(snakeEyesResourceUrl, 'snake-eyes', .1, {x: 12, y: 0, z: 8}, true)

let masterChiefResourceUrl = './models/halo-infinite-master-chief-rigged-walk./scene.gltf'
loadGLTF(masterChiefResourceUrl, 'master-chief', 5, {x: -5, y: 0, z: 20}, true)

let ironManResourceUrl = './models/iron_man_bleeding_edge/scene.gltf'
loadGLTF(ironManResourceUrl, 'iron-man', 17, {x: -23, y: 0, z: -20}, false, 0, 0)

// let squidGameResourceUrl = './models/squid_game_-_guards/scene.gltf'
// loadGLTF(squidGameResourceUrl, 10, {x: 0, y: .01, z: -12}, false)

let godzillaResourceUrl = './models/godzilla-walk-anim/scene.gltf'
loadGLTF(godzillaResourceUrl, 'godzilla', .1, {x: 0, y: .1, z: -200}, true)

let cyberpunkApartmentResourceUrl = './models/cyberpunk-apartment/scene.gltf'
loadGLTF(cyberpunkApartmentResourceUrl, "cyber-punk-apt", 7, {x: 55, y: 0.25, z: -35}, false)

// let keanuResourceUrl = './models/cyber-keanu/scene.gltf'
// loadGLTF(keanuResourceUrl, .25, {x: 10, y: 0, z: 8}, false)

let ninjaResourceUrl = './models/ninja.fbx'
loadFBX(ninjaResourceUrl, 0.1, {x: -12, y: 0, z: 8}, true, 'angry.fbx')

// GLTF Loader function
function loadGLTF(resourceUrl, name, scale, position, animate, xRotation = 0, yRotation = 0) {
    let mixer;
    let loader = new GLTFLoader();
    loader.load(
      // resource URL
      resourceUrl,
      // called when the resource is loaded
      function ( gltf ) {
        gltf.scene.scale.set(scale,scale,scale);

        gltf.scene.position.x = position.x;
        gltf.scene.position.y = position.y;
        gltf.scene.position.z = position.z;

        gltf.scene.rotation.x = xRotation;
        gltf.scene.rotation.y = yRotation;
    
        mixer = new THREE.AnimationMixer( gltf.scene );
        console.log(gltf.animations);

        if(animate) {
          var action = mixer.clipAction( gltf.animations[0] );
          action.play();
        } 
        gltf.scene.callback = function() {
          console.log("gltf callback baby!")
        }

        scene.add(gltf.scene);
        mixers.push(mixer);
      },
      // called while loading is progressing
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened loading Goku' );
      }
    );
}

// FBX Loader function
function loadFBX(resourceUrl, scale, position, animate, animationUrl) {
    // todo
    let loader = new FBXLoader();
    loader.load(resourceUrl, model => {
      model.scale.set(scale, scale, scale)
      model.position.set(position.x, position.y, position.z)

      let mixer = new THREE.AnimationMixer(model)

      if(animate) {
          let anim = new FBXLoader();
          anim.setPath('./models/');
          anim.load(animationUrl, (anim) => {
          let action = mixer.clipAction(anim.animations[0])
          console.log("we bout to animate!")
          action.play()
        })
      }
      
      scene.add(model);
      mixers.push(mixer);
    })
}

// load 3d text
function loadText(fontUrl, text, size, height, position, shadow, xRotation = 0, yRotation = 0) {
  const loader = new FontLoader();

  loader.load(fontUrl, function (font) {
    const geometry = new TextGeometry(text, {
      font: font,
      size: size,
      height: height,
    })
    const textMesh = new THREE.Mesh(geometry, [
      new MeshPhongMaterial({ color: 0xffffff}),
      new MeshPhongMaterial({ color: 0x009390}),
    ])

    textMesh.castShadow = shadow
    textMesh.position.set(position[0], position[1], position[2])
    textMesh.rotation.x = xRotation
    textMesh.rotation.y = yRotation
    scene.add(textMesh)
  })
}

let metaverseHeader = 'Metaverse'
let optimerBoldUrl = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json'
loadText(optimerBoldUrl, metaverseHeader, 6, 2, [-18, -11, 27], true, -.5)

// build and add torus rings

const geometry = new THREE.TorusGeometry(10, 0.5, 10, 100);
const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x00dadf});
const torus = new THREE.Mesh(geometry, blueMaterial);

torus.position.set(0, -15, 15);
scene.add(torus);

// build and add torus rings

const torus2 = new THREE.Mesh(geometry, blueMaterial);
const torus3 = new THREE.Mesh(geometry, blueMaterial);

torus2.position.set(0, -15, 15);
torus3.position.set(0, -15, 15);
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
  const geometry = new THREE.SphereGeometry(.5, 24, 24);
  const material = new THREE.MeshStandardMaterial({color:0xffffff});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(()=> THREE.MathUtils.randFloatSpread(1000));
  star.position.set(x,y,z);
  scene.add(star);
}

Array(1000).fill().forEach(addStar);

// space background texture

const spaceTexture = new THREE.TextureLoader().load('/assets/space-2.jpg');
scene.background = spaceTexture;

// fubo cube

const fuboTexture = new THREE.TextureLoader().load('/assets/fubo-bg.jpg');
// const jakeTexture = new THREE.TextureLoader().load('/assets/jake-bw.jpeg');

const fuboCube = new THREE.Mesh(
  new THREE.BoxGeometry(6,6,6),
  new THREE.MeshBasicMaterial({map:fuboTexture})
);

fuboCube.position.set(20, 6, 40);
fuboCube.callback = function () {
  console.log("fubo cube!");
}
scene.add(fuboCube);

// prome cube

const promeTexture = new THREE.TextureLoader().load('/assets/prometheus.jpg');
const promeCube = new THREE.Mesh(
  new THREE.BoxGeometry(6,6,6),
  new THREE.MeshBasicMaterial({map: promeTexture})
);

promeCube.position.set(-20, 6, 40);
promeCube.callback = function () {
  console.log("Prometheus!")
}
scene.add(promeCube);

// moon

const moonTexture = new THREE.TextureLoader().load('/assets/moon.jpeg');
const normalTexture = new THREE.TextureLoader().load('/assets/moon-normal-map.jpg');
const sphereMaterial = new THREE.MeshStandardMaterial({
  normalMap: normalTexture
})

sphereMaterial.color = new THREE.Color(0x292929)

const sphereGeometry = new THREE.SphereGeometry(1, 16, 16)

const moon = new THREE.Mesh(
  sphereGeometry,
  sphereMaterial
);

moon.position.set(0, -15, 15);

scene.add(moon);

// add items to gui

function buildGui() {
  let moonFolder = gui.addFolder('moon');
  let fuboCubeFolder = gui.addFolder('fuboCube');
  let cameraFolder = gui.addFolder('camera');

  moonFolder.add(moon.position, 'x');
  moonFolder.add(moon.position, 'y');
  moonFolder.add(moon.position, 'z');

  fuboCubeFolder.add(fuboCube.position, 'x');
  fuboCubeFolder.add(fuboCube.position, 'y');
  fuboCubeFolder.add(fuboCube.position, 'z');

  cameraFolder.add(camera.position, 'x');
  cameraFolder.add(camera.position, 'y');
  cameraFolder.add(camera.position, 'z');

  cameraFolder.add(camera.rotation, 'x');
  cameraFolder.add(camera.rotation, 'y');
  cameraFolder.add(camera.rotation, 'z');
}

function updateTorus() {
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  torus.rotation.z += 0.01;

  torus2.rotation.x -= 0.02;
  torus2.rotation.y -= 0.02;
  torus2.rotation.z -= 0.02;

  torus3.rotation.x -= 0.02;
  torus3.rotation.y += 0.02;
  torus3.rotation.z -= 0.02;
}

function updateFuboCube() {
  fuboCube.rotation.x -= 0.005;
  fuboCube.rotation.y -= 0.005;
  fuboCube.rotation.z -= 0.005;
}

function updatePromeCube() {
  promeCube.rotation.x += 0.005;
  promeCube.rotation.y += 0.005;
  promeCube.rotation.z += 0.005;
}

function updateMoon() {
  moon.material.color = new THREE.Color(0xffffff * Math.random());
  moon.material.needsUpdate = true;
}

function updateMixers(clockDelta) {
  // huge help in fixing the animations being slow! - https://discourse.threejs.org/t/too-slow-animation/2379/6
  
  // update mixers for animation
  for (let i = 0, l = mixers.length; i < l; i ++) {
    mixers[i].update(clockDelta);
  }
}

let clock = new THREE.Clock();
buildGui();

// handle mousedown events

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onDocumentMouseDown( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( scene.children ); 

    if ( intersects.length > 0 ) {
      console.log(intersects)
      let callback = intersects[0].object.callback;
      console.log(callback)
      if(callback instanceof Function) {
        callback()
      } else {
        console.log("error: callback not a function")
      }
    }

}

// handle key events

function keyDownHandler(event) {
  console.log(event.keyCode)
  switch (event.keyCode) {
    case 87: // w
      camera.position.z -= 5
      break;
    case 65: // a
      break;
    case 83: // s
      camera.position.z += 5
      break;
    case 68: // d
      break;
    case 38: // up
      console.log("forward!");
      camera.position.z -= 3
      break;
    case 37: // left
      camera.position.x -= 3
      break;
    case 40: // down
      camera.position.z += 3
      break;
    case 39: // right
      camera.position.x += 3
      break;
  }
}

// update camera position

function updateCameraPosition(position = [0, 12, 73], fov = 50, zoom = 1) {
  camera.position.set(position[0], position[1], position[2]);
  camera.fov = fov;
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
}

let clockDelta;

function animate() {
  requestAnimationFrame(animate)
  clockDelta = clock.getDelta()

  updateTorus();

  updateFuboCube();

  updatePromeCube();

  // updateMoon();

  updateMixers(clockDelta);

  controls.update();

  renderer.render(scene, camera);
}

animate();