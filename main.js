import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshPhongMaterial, Vector3 } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import TWEEN from '@tweenjs/tween.js'

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

// 6. 3D OG Pong
// nuff said

// 7. 3D transitions like ESPN/Sports Broadcasts
// this would be sick

// document event listeners

// window.addEventListener('resize', function() {
//   var WIDTH = window.innerWidth,
//     HEIGHT = window.innerHeight;
//   renderer.setSize(WIDTH, HEIGHT);
//   camera.aspect = WIDTH / HEIGHT;
//   camera.updateProjectionMatrix();
// });

document.addEventListener('keydown', keyDownHandler, false)
document.addEventListener('mousedown', onDocumentMouseDown, false)

var buttons = document.getElementsByTagName('button')
buttons[0].addEventListener('click', onButtonClick, false)

// renderer

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#world'),
})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

// camera 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.name = "camera-1"
let cameraFocus = "origin"

// controls to move the scene

const controls = new OrbitControls(camera, renderer.domElement)
// let controls = new MapControls(camera, renderer.domElement)

// gui

// const gui = new dat.GUI()

// main scene

const scene = new THREE.Scene()

// clock used to track time deltas

let clock = new THREE.Clock()
let clockDelta

// help track mouse movement events

var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

// animation mixers array - https://www.mixamo.com - for more animations and models

let mixers = []

// build and add torus rings

const geometry = new THREE.TorusGeometry(10, 0.5, 10, 100)
const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x00dadf})

const torus = new THREE.Mesh(geometry, blueMaterial)
const torus2 = new THREE.Mesh(geometry, blueMaterial)
const torus3 = new THREE.Mesh(geometry, blueMaterial)

// lights
const ambientLight = new THREE.AmbientLight(0xffffff)
const pointLight = new THREE.PointLight(0x00beee, 3, 100)

// helpers

const gridHelper = new THREE.GridHelper(2000, 100, 0xffffff, 0x00dadf)

// space background texture

const spaceTexture = new THREE.TextureLoader().load('/assets/space-2.jpg')
scene.background = spaceTexture

// fubo cube

const fuboTexture = new THREE.TextureLoader().load('/assets/fubo-bg.jpg')
// const jakeTexture = new THREE.TextureLoader().load('/assets/jake-bw.jpeg')

const fuboCube = buildBoxGeometry(6, 6, 6, fuboTexture)

fuboCube.name = "fuboCube"
let stadiumVisible = false

fuboCube.callback = function () {
  if(cameraFocus != "fuboCube") {
    cameraFocus = "fuboCube"

    // add floating stadium
    if(!stadiumVisible) {
      setupFuboScene()
    }

     // tween test area
     var position = { x : camera.position.x, y: camera.position.y, z: camera.position.z}
     var target = { x : 27, y: 8, z: 63}
     var tween3 = new TWEEN.Tween(position).to(target, 1000)
 
     tween3.onUpdate(function() {
       camera.position.x = position.x
       camera.position.y = position.y
       camera.position.z = position.z
     })
 
     tween3.start()

     // move camera to focus the cube
     // todo: fix focus on mobile
    if(window.innerWidth > 1000) {
      // camera.position.set(25, 8, 63)
      // move focal point of controls
      controls.target = new THREE.Vector3(25, 8, 40)
    } else {
      // camera.position.set(14, 8, 55)
      // move focal point of controls 
      controls.target = new THREE.Vector3(14, 7, 40)
    }
    
  } else {
    // open fubo website in new tab
    // window.open('http://www.fubo.tv', '_blank');
  }
}

function setupFuboScene() {
  // console.log("\nsetupFuboScene()")
  stadiumVisible = true
  // loadGLTF(barcelonaStadiumResourceUrl, 'barcelona-stadium', 0.0009, {x: 30, y: 13.5, z: 40}, false, 0.75, 180, 0)

  removeObject('click-me-text')

  let fuboHeader = 'fuboTV'
  loadText(optimerBoldUrl, 'fubo-header', fuboHeader, 1, .25, [24, 11, 40], true, 0)

  let fuboSubHeader = 'The Future of Interactive Streaming'
  loadText(optimerBoldUrl, 'fubo-sub-header', fuboSubHeader, .6, .20, [24, 9.75, 40], true, 0)

  let fuboTVText = 'TV'
  loadText(optimerBoldUrl, 'fubo-tv-link', fuboTVText, .6, .2, [24.5, 3.75, 40 ], true, 0)

  let fuboGamingText = 'BET'
  loadText(optimerBoldUrl, 'fubo-sportsbook-link', fuboGamingText, .6, .2, [29.5, 3.75, 40 ], true, 0)

  let fuboNewsText = 'NEWS'
  loadText(optimerBoldUrl, 'fubo-news-link', fuboNewsText, .6, .2, [34, 3.75, 40 ], true, 0)
  
  // black floor and background for fubo scene

  const fuboSceneTextBackground = new THREE.Mesh(
    new THREE.BoxGeometry(50,25,1),
    new THREE.MeshBasicMaterial()
  )

  fuboSceneTextBackground.material.color.setHex( 0x000012 )
  fuboSceneTextBackground.position.set(25, 12.5, 35)
  fuboSceneTextBackground.name = 'fubo-scene-background'

  const fuboSceneTextFloor = new THREE.Mesh(
    new THREE.BoxGeometry(50,1,50),
    new THREE.MeshBasicMaterial()
  )

  fuboSceneTextFloor.material.color.setHex( 0x000012 )
  fuboSceneTextFloor.position.set(25, 0, 59.5)
  fuboSceneTextFloor.name = 'fubo-scene-floor'

  scene.add(fuboSceneTextBackground)
  scene.add(fuboSceneTextFloor)

  // child cubes
  const blackTexture1 = new THREE.TextureLoader().load('/assets/gold-texture.jpeg')
  let fuboChildCube1 = new THREE.Mesh(
    new THREE.BoxGeometry(3,3,3),
    new THREE.MeshBasicMaterial({map: blackTexture1})
  )

  fuboChildCube1.callback = () => {
    openWebsite('https://www.fubo.tv')
  }

  // fuboChildCube1.material.color.setHex( 0x00FFF7 )
  fuboChildCube1.position.set(25, 6.5, 40)
  fuboChildCube1.name = 'fubo-child-cube-1'

  const blackTexture2 = new THREE.TextureLoader().load('/assets/silver-texture.jpeg')
  let fuboChildCube2 = new THREE.Mesh(
    new THREE.BoxGeometry(3,3,3),
    new THREE.MeshBasicMaterial({map: blackTexture2})
  );

  fuboChildCube2.callback = () => {
    openWebsite('https://www.fubosportsbook.com')
  }

  // fuboChildCube2.material.color.setHex( 0x00FFF7 )
  fuboChildCube2.position.set(30, 6.5, 40)
  fuboChildCube2.name = 'fubo-child-cube-2'

  const blackTexture3 = new THREE.TextureLoader().load('/assets/bronze-texture.jpeg')
  let fuboChildCube3 = new THREE.Mesh(
    new THREE.BoxGeometry(3,3,3),
    new THREE.MeshBasicMaterial({map: blackTexture3})
  );

  fuboChildCube3.callback = () => {
    openWebsite('https://www.google.com/search?q=fubotv+news')
  }

  // fuboChildCube3.material.color.setHex( 0x00FFF7 )
  fuboChildCube3.position.set(35, 6.5, 40)
  fuboChildCube3.name = 'fubo-child-cube-3'

  scene.add(fuboChildCube1)
  scene.add(fuboChildCube2)
  scene.add(fuboChildCube3)
}

function openWebsite(url = "", newTab = true) {
  if(newTab) {
    window.open(url, '_blank')
  } else {
    window.open(url)
  }
}

function tearDownFuboScene() {
  stadiumVisible = false
  removeObject('barcelona-stadium')
  removeObject('fubo-header')
  removeObject('fubo-sub-header')
  removeObject('fubo-website-link')
  removeObject('fubo-scene-floor')
  removeObject('fubo-scene-background')
  removeObject('fubo-child-cube-1')
  removeObject('fubo-child-cube-2')
  removeObject('fubo-child-cube-3')
  removeObject('fubo-news-link')
  removeObject('fubo-tv-link')
  removeObject('fubo-sportsbook-link')
  loadText(optimerBoldUrl, 'click-me-text', clickMeText, 1, .5, [13, 12, 40], true, 0, -.5, 0)
}

// prome cube

const promeTexture = new THREE.TextureLoader().load('/assets/prometheus.jpg')
const promeCube = buildBoxGeometry(6, 6, 6, promeTexture)

promeCube.callback = function () {
  // open prometheus definition
  // window.open('https://www.merriam-webster.com/dictionary/Prometheus', '_blank')

  // find all the meshes
  // how do you do that?
  // let masterChief= scene.getObjectByName("master-chief");
  // console.log(masterChief);
  // decrease their animation speed to 1/60th normal
}

function buildBoxGeometry(scaleX = 1, scaleY = 1, scaleZ = 1, texture = new THREE.MeshBasicMaterial()) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(scaleX,scaleY,scaleX),
    new THREE.MeshBasicMaterial({map: texture})
  )
}

// moon

const moonTexture = new THREE.TextureLoader().load('/assets/moon.jpeg')
const normalTexture = new THREE.TextureLoader().load('/assets/moon-normal-map.jpg')
const sphereMaterial = new THREE.MeshStandardMaterial({
  normalMap: normalTexture
})

sphereMaterial.color = new THREE.Color(0x292929)
const sphereGeometry = new THREE.SphereGeometry(1, 16, 16)

const moon = new THREE.Mesh(
  sphereGeometry,
  sphereMaterial
)

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
Array(1000).fill().forEach(addStar)

// don't load master chief on mobile
if(window.innerWidth > 1000) {
  // loadGLTF(masterChiefResourceUrl, 'master-chief', 7.5, {x: 0, y: 0, z: 25}, true)
  loadGLTF(snakeEyesResourceUrl, 'snake-eyes', .15, {x: -10, y: 0, z: 20}, true)
  loadGLTF(gokuResourceUrl, 'goku', 8, {x: 10, y: 0, z: 20}, true)
  fuboCube.position.set(20, 6, 40)
  promeCube.position.set(-20, 6, 40)
} else {
  loadGLTF(snakeEyesResourceUrl, 'snake-eyes', .15, {x: -7, y: 0, z: 20}, true)
  loadGLTF(gokuResourceUrl, 'goku', 8, {x: 7, y: 0, z: 20}, true)
  fuboCube.position.set(10, 6, 40)
  promeCube.position.set(-10, 6, 40)
}

let metaverseHeader = 'Metaverse'
loadText(optimerBoldUrl, 'metaverse-header', metaverseHeader, 6, 2, [-18, -11, 27], true, -.5)

let clickMeText = 'Click Me!'
loadText(optimerBoldUrl, 'click-me-text', clickMeText, 1, .5, [13, 12, 40], true, 0, -.5, 0)

// lights
scene.add(pointLight)
scene.add(ambientLight)

// metaverse rings
scene.add(torus)
scene.add(torus2)
scene.add(torus3)

// metaverse floor grid
scene.add(gridHelper)
// sphere
scene.add(moon)
// cubes
scene.add(promeCube)
scene.add(fuboCube)

// tween test area

var position = { x : 0, y: 0}
var target = { x : 17, y: 6}
var tween = new TWEEN.Tween(position).to(target, 2500)

tween.onUpdate(function() {
  fuboCube.position.x = position.x
  fuboCube.position.y = position.y
})

tween.start()

// promecube opposite animation

var position2 = { x : 0, y: 0}
var target2 = { x : 17, y: 6}
var tween2 = new TWEEN.Tween(position2).to(target2, 2500)

tween2.easing(TWEEN.Easing.Quadratic.Out)

tween2.onUpdate(function(){
  promeCube.position.x = -position.x
  promeCube.position.y = position.y
})

tween2.start()

// camera tween : todo for animation to focus on fubo cube from wherever you are when you click it

// end test area

// GLTF Loader function
function loadGLTF(resourceUrl, name, scale, position, animate, xRotation = 0, yRotation = 0, zRotation = 0, callback = function() {console.log("no callback")}) {
  let mixer
  let loader = new GLTFLoader()
  loader.load(
    // resource URL
    resourceUrl,
    // called when the resource is loaded
    function ( gltf ) {
      gltf.scene.scale.set(scale,scale,scale)

      gltf.scene.name = name

      gltf.scene.position.x = position.x
      gltf.scene.position.y = position.y
      gltf.scene.position.z = position.z

      gltf.scene.rotation.x = xRotation
      gltf.scene.rotation.y = yRotation
      gltf.scene.rotation.z = zRotation
  
      mixer = new THREE.AnimationMixer( gltf.scene )

      if(animate) {
        var action = mixer.clipAction(gltf.animations[0])
        action.play()
      }

      // console.log("\ndebug callback")
      // console.log(gltf.scene)
      // console.log(callback)
      gltf.scene.callback = callback
      // console.log(gltf.scene.callback)

      scene.add(gltf.scene)
      mixers.push(mixer)
    },
    // called while loading is progressing
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened loading GLTF model' )
    }
  );
}

// FBX Loader function
function loadFBX(resourceUrl, scale, position, animate, animationUrl) {
  let loader = new FBXLoader()
  loader.load(resourceUrl, model => {
    model.scale.set(scale, scale, scale)
    model.position.set(position.x, position.y, position.z)

    let mixer = new THREE.AnimationMixer(model)

    if(animate) {
        let anim = new FBXLoader()
        anim.setPath('./models/')
        anim.load(animationUrl, (anim) => {
        let action = mixer.clipAction(anim.animations[0])
        action.play()
      })
    }
    
    scene.add(model)
    mixers.push(mixer)
  })
}

// load 3d text
function loadText(fontUrl, name, text, size, height, position, shadow, xRotation = 0, yRotation = 0, zRotation = 0) {
  const loader = new FontLoader()

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

    textMesh.name = name

    textMesh.castShadow = shadow
    textMesh.position.set(position[0], position[1], position[2])
    textMesh.rotation.x = xRotation
    textMesh.rotation.y = yRotation
    scene.add(textMesh)
  })
}

// add items to gui

function buildGui() {
  let moonFolder = gui.addFolder('moon')
  let fuboCubeFolder = gui.addFolder('fuboCube')
  let cameraFolder = gui.addFolder('camera')

  moonFolder.add(moon.position, 'x')
  moonFolder.add(moon.position, 'y')
  moonFolder.add(moon.position, 'z')

  fuboCubeFolder.add(fuboCube.position, 'x')
  fuboCubeFolder.add(fuboCube.position, 'y')
  fuboCubeFolder.add(fuboCube.position, 'z')

  cameraFolder.add(camera.position, 'x')
  cameraFolder.add(camera.position, 'y')
  cameraFolder.add(camera.position, 'z')

  cameraFolder.add(camera.rotation, 'x')
  cameraFolder.add(camera.rotation, 'y')
  cameraFolder.add(camera.rotation, 'z')
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
  // todo: find a way to stop the rotation speed from increasing when camera is reset
  controls.target = new THREE.Vector3(0, 0, 0)
  cameraFocus = "origin"
  updateCameraPosition([0, 12, 73], 50, 1)
  tearDownFuboScene()
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

function onDocumentMouseDown(event) {
  event.preventDefault();

  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1

  raycaster.setFromCamera( mouse, camera )

  var intersects = raycaster.intersectObjects( scene.children )

  if ( intersects.length > 0 ) {
    // console.log(intersects)
    let object = intersects[0].object
    let callback = object.callback
    // console.log("\ndebug object")
    // console.log(object)
    // console.log(callback)
    if(callback instanceof Function) {
      callback()
    } else {
      console.log("error: callback not a function")
    }
  }
}

// on the way to hover effects....potentially

function onMouseOver(event) {
  // console.log("on mouse over")
}

// on button click

function onButtonClick(event) {
  resetCamera()
}

// handle key events

function keyDownHandler(event) {
  // console.log(event.keyCode)
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
  camera.position.set(position[0], position[1], position[2])
  camera.fov = fov
  camera.zoom = zoom
  camera.updateProjectionMatrix()
}

// get object from the scene

function getObjectByName(name) {
  return scene.getObjectByName(name)
}

// remove object from scene

function removeObject(objectName) {
  scene.remove(getObjectByName(objectName))
}

function animate() {
  requestAnimationFrame(animate)
  
  clockDelta = clock.getDelta()

  TWEEN.update()

  updateTorus()

  updateFuboCube()

  updatePromeCube()

  updateMixers(clockDelta)

  controls.update()

  renderer.render(scene, camera)
}

animate()