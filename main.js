import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AnimationObjectGroup, MeshPhongMaterial, Vector3 } from 'three'
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

const torusGroup = new THREE.Group()

const geometry = new THREE.TorusGeometry(9, 0.5, 10, 100)
const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x00dadf})

const torus = new THREE.Mesh(geometry, blueMaterial)
const torus2 = new THREE.Mesh(geometry, blueMaterial)
const torus3 = new THREE.Mesh(geometry, blueMaterial)

torusGroup.add(torus)
torusGroup.add(torus2)
torusGroup.add(torus3)

const focusTorusGeometry = new THREE.TorusGeometry(5, 0.25, 5)
const focusTorusMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff})
const focusTorus = new THREE.Mesh(focusTorusGeometry, focusTorusMaterial)
focusTorus.rotation.x = -1.575
focusTorus.rotation.y = 0
focusTorus.rotation.z = 0

scene.add(focusTorus)

// lights
const ambientLight = new THREE.AmbientLight(0xffffff)
const pointLight = new THREE.PointLight(0x00beee, 3, 100)

// grid floor

const gridHelper = new THREE.GridHelper(2000, 100, 0xffffff, 0x00dadf)

// space background texture

const spaceTexture = new THREE.TextureLoader().load('/assets/space-2.jpg')
scene.background = spaceTexture

// fubo cube

const fuboTexture = new THREE.TextureLoader().load('/assets/fubo-bg.jpg')

const fuboCube = buildBoxGeometry(4, 4, 4, fuboTexture)

fuboCube.name = "fuboCube"
let stadiumVisible = false

fuboCube.callback = function () {
  // initFuboScene()
}

function initFuboScene() {
  if(cameraFocus != "fuboCube") {
    cameraFocus = "fuboCube"

    // add floating stadium
    if(!stadiumVisible) {
      setupFuboScene()
      var position = { x : 17, y: 6}

      var target = { x : 32, y: 6}
      var tween = new TWEEN.Tween(position).to(target, 1500)

      tween.onUpdate(function() {
        fuboCube.position.x = position.x
        fuboCube.position.y = position.y
      })

      tween.start()
    }

    // animate to fubo scene
    animateToScene("fubo")
    
  } else {
    // open fubo website in new tab
    // window.open('http://www.fubo.tv', '_blank');
  }
}

function setupFuboScene() {
  // console.log("\nsetupFuboScene()")
  stadiumVisible = true

  let fuboHeader = 'fuboTV'
  loadText(optimerBoldUrl, 'fubo-header', fuboHeader, 1, .25, [39, 11, 40], true, 0)

  let fuboSubHeader = 'The Future of Interactive Streaming'
  loadText(optimerBoldUrl, 'fubo-sub-header', fuboSubHeader, .6, .20, [39, 9.75, 40], true, 0)

  let fuboTVText = 'TV'
  loadText(optimerBoldUrl, 'fubo-tv-link', fuboTVText, .6, .2, [39.5, 3.75, 40 ], true, 0)

  let fuboGamingText = 'BET'
  loadText(optimerBoldUrl, 'fubo-sportsbook-link', fuboGamingText, .6, .2, [44.5, 3.75, 40 ], true, 0)

  let fuboNewsText = 'NEWS'
  loadText(optimerBoldUrl, 'fubo-news-link', fuboNewsText, .6, .2, [49, 3.75, 40 ], true, 0)

  const fuboCubeGroup = new THREE.Group()
  fuboCubeGroup.name = 'fubo-cube-group'

  // child cubes
  const blackTexture1 = new THREE.TextureLoader().load('/assets/gold-texture.jpeg')
  let fuboTVCube = new THREE.Mesh(
    new THREE.BoxGeometry(3,3,3),
    new THREE.MeshBasicMaterial({map: blackTexture1})
  )

  fuboTVCube.callback = () => {
    openWebsite('https://www.fubo.tv')
  }

  fuboTVCube.position.set(40, 6.5, 40)
  fuboTVCube.name = 'fubo-tv-cube'

  const blackTexture2 = new THREE.TextureLoader().load('/assets/silver-texture.jpeg')
  let fuboBetCube = new THREE.Mesh(
    new THREE.BoxGeometry(3,3,3),
    new THREE.MeshBasicMaterial({map: blackTexture2})
  );

  fuboBetCube.callback = () => {
    openWebsite('https://www.fubosportsbook.com')
  }

  fuboBetCube.position.set(45, 6.5, 40)
  fuboBetCube.name = 'fubo-bet-cube'

  const blackTexture3 = new THREE.TextureLoader().load('/assets/bronze-texture.jpeg')
  let fuboNewsCube = new THREE.Mesh(
    new THREE.BoxGeometry(3,3,3),
    new THREE.MeshBasicMaterial({map: blackTexture3})
  );

  fuboNewsCube.callback = () => {
    openWebsite('https://www.google.com/search?q=fubotv+news')
  }

  // fuboChildCube3.material.color.setHex( 0x00FFF7 )
  fuboNewsCube.position.set(50, 6.5, 40)
  fuboNewsCube.name = 'fubo-news-cube'

  fuboCubeGroup.add(fuboTVCube)
  fuboCubeGroup.add(fuboBetCube)
  fuboCubeGroup.add(fuboNewsCube)
  scene.add(fuboCubeGroup)
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
  removeObject('fubo-header')
  removeObject('fubo-sub-header')
  removeObject('fubo-website-link')
  removeObject('fubo-scene-floor')
  removeObject('fubo-scene-background')
  removeObject('fubo-cube-group')
  removeObject('fubo-news-link')
  removeObject('fubo-tv-link')
  removeObject('fubo-sportsbook-link')
  // animateObjectToPosition(fuboCube, [17, 6], 1500)
}

function animateObjectToPosition(object, target, time) {
  var position = { x : object.position.x, y: object.position.y}
  var target = { x : target[0], y: target[1]}
  var tween = new TWEEN.Tween(position).to(target, time)

  tween.onUpdate(function() {
    object.position.x = position.x
    object.position.y = position.y
  })

  tween.start()
}

// prome cube

const promeTexture = new THREE.TextureLoader().load('/assets/prometheus.jpg')
const promeCube = buildBoxGeometry(4, 4, 4, promeTexture)

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
let snakeEyesResourceUrl = './models/snake-eyes/scene.gltf'
let masterChiefResourceUrl = './models/halo-infinite-master-chief-rigged-walk./scene.gltf'
let barcelonaStadiumResourceUrl = './models/camp-nou-stadium/scene.gltf'
let hoverCarResourceUrl = './models/hover-car/scene.gltf'
let hoverBikeResourceUrl = './models/hover-bike/scene.gltf'
let astronautResourceUrl = './models/astronaut/scene.gltf'
let toriiGateResourceUrl = './models/torii-gate/scene.gltf'

// set positions

torusGroup.position.set(0, 22, -10)

focusTorus.position.set(0, 0, 41)

// moon.position.set(0, 0, 0);

pointLight.position.set(0, 25, 45)

updateCameraPosition([0, 20, 75], 50, 1)

// add objects to the scene

// Add stars
Array(1000).fill().forEach(addStar)

// main menu

// add small car to menu - when clicked it shows the big version
loadGLTF(hoverCarResourceUrl, 'hover-car-small', 2, {x: -12.5, y: 2.5, z: 40}, true, 0, 45)

// add small astronaut to menu - when focused and click enter it shows the big one
loadGLTF(astronautResourceUrl, 'astronaut-small', 2.5, {x: 12.5, y: 0, z: 40}, true, 0, 0, 0)

// add small goku to menu - when focused and click enter it shows the big one
loadGLTF(gokuResourceUrl, 'goku-small', 3, {x: 3, y: 1, z: 40}, true, 0)

// add small snake eyes to menu - when focused and click enter it shows the big one
loadGLTF(snakeEyesResourceUrl, 'snake-eyes-small', .055, {x: -3, y: 1, z: 40}, true)

// add torii gate to background
loadGLTF(toriiGateResourceUrl, 'torii-gate', 9, {x: 0, y: 0, z: -30}, false)

// load intitial layout into focus area
function loadLanding() {
  loadGLTF(snakeEyesResourceUrl, 'snake-eyes', .15, {x: -10, y: 0, z: 20}, true)
  loadGLTF(gokuResourceUrl, 'goku', 8, {x: 10, y: 0, z: 20}, true)
}
loadLanding()

// change variables based on screen width
if(window.innerWidth > 1000) {
  // loadGLTF(masterChiefResourceUrl, 'master-chief', 7.5, {x: 0, y: 0, z: 25}, true)
  // loadGLTF(snakeEyesResourceUrl, 'snake-eyes', .15, {x: -10, y: 0, z: 20}, true)
  // loadGLTF(gokuResourceUrl, 'goku', 8, {x: 10, y: 0, z: 20}, true)
  // fuboCube.position.set(25, 6, 40)
  // promeCube.position.set(-25, 6, 40)
} else {
  // loadGLTF(snakeEyesResourceUrl, 'snake-eyes', .15, {x: -7, y: 0, z: 20}, true)
  // loadGLTF(gokuResourceUrl, 'goku', 8, {x: 7, y: 0, z: 20}, true)
  // fuboCube.position.set(10, 6, 40)
  // promeCube.position.set(-10, 6, 40)
}

let metaverseHeader = 'Metaverse'
loadText(optimerBoldUrl, 'metaverse-header', metaverseHeader, 2, .5, [-6.5, 22, -10], true, 0, 0, 0)

let keyHint = 'Use arrows to navigate'
loadText(optimerBoldUrl, 'key-hint-header', keyHint, .75, .05, [-5, 0, 49], true, 0, 0, 0)

// lights
scene.add(pointLight)
scene.add(ambientLight)

// metaverse rings
scene.add(torusGroup)

// metaverse floor grid
scene.add(gridHelper)
// sphere
// scene.add(moon)

// cubes
scene.add(promeCube)
scene.add(fuboCube)

// tween test area

var position = { x : 0, y: 0, z: 40}
var target = { x : 25, y: 5, z: 40}
var tween = new TWEEN.Tween(position).to(target, 2500)

tween.onUpdate(function() {
  fuboCube.position.x = position.x
  fuboCube.position.y = position.y
  fuboCube.position.z = position.z
})

tween.start()

// promecube opposite animation

var position2 = { x : 0, y: 0, z: 40}
var target2 = { x : 25, y: 5, z: 40}
var tween2 = new TWEEN.Tween(position2).to(target2, 2500)

tween2.easing(TWEEN.Easing.Quadratic.Out)

tween2.onUpdate(function(){
  promeCube.position.x = -position.x
  promeCube.position.y = position.y
  promeCube.position.z = position.z
})

tween2.start()

// camera tween : todo for animation to focus on fubo cube from wherever you are when you click it

// end test area

// GLTF Loader function
function loadGLTF(resourceUrl, name, scale, position, animate, xRotation = 0, yRotation = 0, zRotation = 0, callback = function() {console.log("no callback")}, animationIndex = 0) {
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
        // console.log("\n" + name + " animations: \n")
        // console.log(gltf.animations)
        var action = mixer.clipAction(gltf.animations[animationIndex])
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
      // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
      if(xhr.loaded / xhr.total == 1) {
        // console.log("\nloading finished, proceed with operation")
      }
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened loading GLTF model ' + name )
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
  let focusTorusFolder = gui.addFolder('focusTorus')

  focusTorusFolder.add(focusTorus.rotation, 'x')

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
  cameraFocus = "origin"
  animateToScene("landing")
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

// buildGui()

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
  // console.log("\nonButtonClick()")
  resetCamera()
}

// handle key events

let focusState = 'landing'
let focusTargetPosition

function keyDownHandler(event) {
  // console.log(event.keyCode)
  switch (event.keyCode) {
    case 87: // w
      // camera.position.z -= 5
      break
    case 65: // a
      break
    case 83: // s
      // camera.position.z += 5
      break
    case 68: // d
      break
    case 38: // up
      // camera.position.z -= 3
      break
    case 37: // left
      // move focus torus
      // console.log(focusState)
      if(focusState == 'landing') {
        // removeObject('goku')
        // removeObject('snake-eyes')
        getObjectByName('goku').visible = false
        getObjectByName('snake-eyes').visible = false
        focusTargetPosition = [-12, 0]
        focusState = 'hover-car'
      } else if(focusState == 'astronaut') {
        getObjectByName('astronaut').visible = false
        focusTargetPosition = [0, 0]
        focusState = 'landing'
      } else if(focusState == 'fubo') {
        // remove fubo scene
        focusTargetPosition = [12, 0]
        focusState = 'astronaut'
      } else if(focusState == 'hover-car') {
        getObjectByName('hover-car').visible = false
        getObjectByName('hover-bike').visible = false
        focusTargetPosition = [-24, 0]
        focusState = 'prome'
      }
      updateFocusArea(focusState)
      animateObjectToPosition(focusTorus, focusTargetPosition, 250)
      break
    case 40: // down
      // camera.position.z += 3
      break
    case 39: // right
      // animateToScene("fubo")
      // console.log(focusState)
      if(focusState == 'landing') {
        getObjectByName('goku').visible = false
        getObjectByName('snake-eyes').visible = false
        focusTargetPosition = [12, 0]
        focusState = 'astronaut'
      } else if(focusState == 'astronaut') {
        getObjectByName('astronaut').visible = false
        focusTargetPosition = [24, 0]
        focusState = 'fubo'
      } else if(focusState == 'hover-car') {
        getObjectByName('hover-car').visible = false
        getObjectByName('hover-bike').visible = false
        focusTargetPosition = [0, 0]
        focusState = 'landing'
      } else if(focusState == 'prome') {
        focusTargetPosition = [-12, 0]
        focusState = 'hover-car'
      }
      updateFocusArea(focusState)
      animateObjectToPosition(focusTorus, focusTargetPosition, 250)
      break
    case 13: // enter
      // check where focus is
      // console.log(focusState)
      switch(focusState) {
        case 'fubo':
          //animate to fubo scene
          // initFuboScene()
          break
        case 'hover-car':
          // animate to garage
          // animate to hover car
          // console.log("\nenter \ncurrent scene: " + sceneState.name)
          if(sceneState.name !== "portfolio") {
            animateToScene("portfolio")
            if(!hoverCarLoaded) {
              // loadGLTF(hoverCarResourceUrl, 'hover-car', 10, {x: -70, y: 9, z: 0}, true, 0, 45)
              // loadGLTF(hoverBikeResourceUrl, 'hover-bike', 0.04, {x: -85, y: 6, z: 25}, true, 0, 235)
              // hoverCarLoaded = true
            }
          }
          break
        case 'prome':
          // animate to portfolio
          break
      }
      break
      // move to new scene
    case 27: // escape
      resetCamera()
      break
  }
}

let hoverCarLoaded = false
let astronautLoaded = false

function updateFocusArea(focusState = "") {
  switch(focusState) {
    case "landing":
      // load/show goku and snake eyes
      getObjectByName('goku').visible = true
      getObjectByName('snake-eyes').visible = true
      break
    case "hover-car":
      // load/show hover car and bike
      if(!hoverCarLoaded) {
        loadGLTF(hoverCarResourceUrl, 'hover-car', 8, {x: -12, y: 9, z: 10}, true, 0, 45)
        loadGLTF(hoverBikeResourceUrl, 'hover-bike', 0.04, {x: 20, y: 6, z: 14}, true, 0, 45)
        hoverCarLoaded = true
      } else {
        getObjectByName('hover-car').visible = true
        getObjectByName('hover-bike').visible = true
      }
      break
    case "astronaut":
      // load/show astronaut
      if(!astronautLoaded) {
        loadGLTF(astronautResourceUrl, 'astronaut', 7, {x: 0, y: 2, z: 20}, true, 0, 0, 0, function(){}, 3)
        astronautLoaded = true
      } else {
        getObjectByName('astronaut').visible = true
      }
      break
    case "prome":
      // load portfolio
      break
    case "fubo":
      // load fubo
      break
  }
}

let sceneStates = {
  totalScenes: 3,
  landing: {
    id: 0,
    name: "landing",
    cameraPosition: [0, 20, 75],
    controlsTargetVector: [0, 0, 0]
  },
  portfolio: {
    id: 1,
    name: "portfolio",
    cameraPosition: [-74, 25, 60],
    controlsTargetVector: [-80, 5, 0]
  },
  fubo: {
    id: 2,
    name: "fubo",
    cameraPosition: [40, 8, 63],
    controlsTargetVector: [40, 8, 50]
  }
}

let sceneState = sceneStates.landing

function animateToScene(sceneName) {
  // console.log("animateToScene: " + sceneName)
  // console.log(sceneStates[sceneName])
  let scenePosition = sceneStates[sceneName].cameraPosition
  // console.log("position: " + scenePosition)
  let controlsTargetVector = sceneStates[sceneName].controlsTargetVector
  // console.log("controlsTargetVector: " + controlsTargetVector)

  controls.target = new THREE.Vector3(controlsTargetVector[0], controlsTargetVector[1], controlsTargetVector[2])

  // tween test area
  var position = { x : camera.position.x, y: camera.position.y, z: camera.position.z}
  var target = { x : scenePosition[0], y: scenePosition[1], z: scenePosition[2]}
  var tween3 = new TWEEN.Tween(position).to(target, 1500)

  tween3.onUpdate(function() {
    camera.position.x = position.x
    camera.position.y = position.y
    camera.position.z = position.z
  })

  tween3.start()

  sceneState = sceneStates[sceneName]
}

// update camera position

function updateCameraPosition(position = [0, 20, 75], fov = 50, zoom = 1) {
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