import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshPhongMaterial, Vector3 } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

// Ideas
// 1. Slow mo button - 
// turns all animations to 1/60th of time scale and maybe zooms in on master chief walking

// 2. Fubo cube additional metadata overlay
// when you click on fubo cube it should give you an indicator like a glow or ring underneath to show it's being focused
// also to do additional things like see website or see when the stock price

// 3. Joystick navigation
// https://codepen.io/ogames/pen/rNmYpdo

// 4. Arcade Cabinet 
// Build a portal to games as an old school arcade cabinet
// Build a cabinet that has all the old games loaded in aka linked to a website where they can play them on the screen
// could get the joystick navigation as input

// 5. Interactivity with animation
// https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js/

// document event listeners

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('mousedown', onDocumentMouseDown, false);

var buttons = document.getElementsByTagName('button');
buttons[0].addEventListener('click', onButtonClick, false);

// renderer

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#world'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// camera 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.name = "camera-1";
let cameraFocus = "origin";

// controls to move the scene

const controls = new OrbitControls(camera, renderer.domElement);
// let controls = new MapControls(camera, renderer.domElement);

// gui

// const gui = new dat.GUI();

// main scene

const scene = new THREE.Scene();

// clock used to track time deltas

let clock = new THREE.Clock();
let clockDelta;

// help track mouse movement events

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// animation mixers array - https://www.mixamo.com - for more animations and models

let mixers = [];

// build and add torus rings

const geometry = new THREE.TorusGeometry(10, 0.5, 10, 100);
const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x00dadf});

const torus = new THREE.Mesh(geometry, blueMaterial);
const torus2 = new THREE.Mesh(geometry, blueMaterial);
const torus3 = new THREE.Mesh(geometry, blueMaterial);

// lights
const ambientLight = new THREE.AmbientLight(0xffffff);
const pointLight = new THREE.PointLight(0x00beee, 3, 100);

// helpers

const gridHelper = new THREE.GridHelper(2000, 100, 0xffffff, 0x00dadf);

// space background texture

const spaceTexture = new THREE.TextureLoader().load('/assets/space-2.jpg');
scene.background = spaceTexture;

// fubo cube

const fuboTexture = new THREE.TextureLoader().load('/assets/fubo-bg.jpg');
// const jakeTexture = new THREE.TextureLoader().load('/assets/jake-bw.jpeg');

const fuboCube = new THREE.Mesh(
  new THREE.BoxGeometry(6,6,6),
  new THREE.MeshStandardMaterial({map:fuboTexture})
);

fuboCube.name = "fuboCube"
let stadiumVisible = false;

fuboCube.callback = function () {
  if(cameraFocus != "fuboCube") {
    cameraFocus = "fuboCube";

    // add floating stadium
    if(!stadiumVisible) {
      stadiumVisible = true;
      loadGLTF(barcelonaStadiumResourceUrl, 'barcelona-stadium', 0.0005, {x: 30, y: 5, z: 40})
    }

    // move camera to focus the cube
    if(window.innerWidth > 1000) {
      camera.position.set(24, 7, 55);
      // move focal point of controls 
      controls.target = new THREE.Vector3(24, 7, 40);
    } else {
      camera.position.set(14, 7, 55);
      // move focal point of controls 
      controls.target = new THREE.Vector3(14, 7, 40);
    }
    
  } else {
    // open fubo website in new tab
    // window.open('http://www.fubo.tv', '_blank');
  }
}

// prome cube

const promeTexture = new THREE.TextureLoader().load('/assets/prometheus.jpg');
const promeCube = new THREE.Mesh(
  new THREE.BoxGeometry(6,6,6),
  new THREE.MeshBasicMaterial({map: promeTexture})
);

promeCube.callback = function () {
  // open prometheus definition
  // window.open('https://www.merriam-webster.com/dictionary/Prometheus', '_blank');

  // find all the meshes
  // how do you do that?
  // let masterChief= scene.getObjectByName("master-chief");
  // console.log(masterChief);
  // decrease their animation speed to 1/60th normal
}

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

// set resource variables

let optimerBoldUrl = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json'
let gokuResourceUrl = './models/goku-rigged-animated/scene.gltf'
let snakeEyesResourceUrl = './models/snake_eyes/scene.gltf'
let masterChiefResourceUrl = './models/halo-infinite-master-chief-rigged-walk./scene.gltf'
let barcelonaStadiumResourceUrl = './models/camp-nou-stadium/scene.gltf'

// set positions

torus.position.set(0, -15, 15);
torus2.position.set(0, -15, 15);
torus3.position.set(0, -15, 15);

moon.position.set(0, -15, 15);

pointLight.position.set(0, 25, 45);

updateCameraPosition([0, 12, 73], 50, 1)

// add objects to the scene

// Add stars
Array(1000).fill().forEach(addStar);

// don't load master chief on mobile
if(window.innerWidth > 1000) {
  loadGLTF(masterChiefResourceUrl, 'master-chief', 7.5, {x: 0, y: 0, z: 25}, true)
  loadGLTF(snakeEyesResourceUrl, 'snake-eyes', .15, {x: -13, y: 0, z: 20}, true)
  loadGLTF(gokuResourceUrl, 'goku', 8, {x: 13, y: 0, z: 20}, true)
  
  fuboCube.position.set(20, 6, 40);
  promeCube.position.set(-20, 6, 40);
} else {
  loadGLTF(snakeEyesResourceUrl, 'snake-eyes', .15, {x: -7, y: 0, z: 20}, true)
  loadGLTF(gokuResourceUrl, 'goku', 8, {x: 7, y: 0, z: 20}, true)
  fuboCube.position.set(10, 6, 40);
  promeCube.position.set(-10, 6, 40);
}

let metaverseHeader = 'Metaverse'
loadText(optimerBoldUrl, metaverseHeader, 6, 2, [-18, -11, 27], true, -.5)

// lights
scene.add(pointLight);
scene.add(ambientLight);

// metaverse rings
scene.add(torus);
scene.add(torus2);
scene.add(torus3);

// metaverse floor grid
scene.add(gridHelper);
// sphere
scene.add(moon);
// cubes
scene.add(promeCube);
scene.add(fuboCube);

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

      gltf.scene.name = name;

      gltf.scene.position.x = position.x;
      gltf.scene.position.y = position.y;
      gltf.scene.position.z = position.z;

      gltf.scene.rotation.x = xRotation;
      gltf.scene.rotation.y = yRotation;
  
      mixer = new THREE.AnimationMixer( gltf.scene );
      // console.log(gltf.animations);
      // console.log(gltf)

      if(animate) {
        var action = mixer.clipAction(gltf.animations[0]);
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

function updateMixers(clockDelta) {
  // huge help in fixing the animations being slow! - https://discourse.threejs.org/t/too-slow-animation/2379/6
  
  // update mixers for animation
  for (let i = 0, l = mixers.length; i < l; i ++) {
    mixers[i].update(clockDelta);
  }
}

function resetCamera() {
  controls.target = new THREE.Vector3(0, 0, 0)
  cameraFocus = "origin";
  updateCameraPosition([0, 12, 73], 50, 1)
  stadiumVisible = false;
  removeObject('barcelona-stadium');
}

// background star effect

function addStar() {
  const geometry = new THREE.SphereGeometry(.5, 24, 24);
  const material = new THREE.MeshStandardMaterial({color:0xffffff});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(()=> THREE.MathUtils.randFloatSpread(1000));
  star.position.set(x,y,z);
  scene.add(star);
}

// buildGui();

// handle mousedown events

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

// on button click

function onButtonClick(event) {
  resetCamera()
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
    case 27: // escape
      resetCamera()
  }
}

// update camera position

function updateCameraPosition(position = [0, 12, 73], fov = 50, zoom = 1) {
  camera.position.set(position[0], position[1], position[2]);
  camera.fov = fov;
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
}

// get object from the scene

function getObjectByName(name) {
  return scene.getObjectByName(name);
}

// remove object from scene

function removeObject(objectName) {
  var selectedObject = getObjectByName(objectName)
  scene.remove(selectedObject);
  animate();
}

function animate() {
  requestAnimationFrame(animate)
  
  clockDelta = clock.getDelta();

  updateTorus();

  updateFuboCube();

  updatePromeCube();

  updateMixers(clockDelta);

  controls.update();

  renderer.render(scene, camera);
}

animate();