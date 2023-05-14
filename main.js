import './style.css'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import MainScene from './scenes/MainScene'
import MetaScene from './scenes/MetaScene'
import InventoryScene from './scenes/InventoryScene'
import SandboxScene from './scenes/SandboxScene'
import SceneController from './helpers/SceneController'

// What should main do?
// initiate scene controller
// send input to world
// show GUI

let windowInnerHeight, windowInnerWidth = 0

//if the user resizes the window you have to adjust the scene to fit within it
window.addEventListener('resize', function() {
	windowInnerHeight = window.innerHeight
	windowInnerWidth = window.innerWidth
	console.log("\nWidth: " + windowInnerWidth)
	renderer.setSize(windowInnerWidth, windowInnerHeight)
	if(typeof camera !== 'undefined') {
		camera.aspect = windowInnerWidth / windowInnerHeight
		camera.updateProjectionMatrix()
	}
})

// ===================================================================
// ===================================================================
// ===================================================================

// main scene
let mainSceneConfig = {
	name: "main-scene",
	gui: false,
	gridFloor: false,
	torusGroup: false,
	focusTorus: false,
	background: ''
}

// meta scene
let metaSceneConfig = {
	name: "meta-scene",
	gui: false,
	background: '',
	gridFloor: true
}

// inventory scene
let inventorySceneConfig = {
	name: "inventory-scene",
	gui: false,
	background: '',
	gridFloor: true,
	// background: './assets/wiami-bg.jpeg'
}

// loading scene
let loadingSceneConfig = {
	name: "loading-scene",
	gui: false,
	background: '',
	gridFloor: true
}

// loading scene
let sandboxSceneConfig = {
	name: "sandbox-scene",
	gui: false,
	background: '',
	gridFloor: true
}

// let mainScene = new MainScene(mainSceneConfig)
let mainScene = new MetaScene(metaSceneConfig)
let inventoryScene = new InventoryScene(inventorySceneConfig)
// let loadingScene = new LoadingScene(loadingSceneConfig)
let sandboxScene = new SandboxScene(sandboxSceneConfig)

let currentScene = mainScene
currentScene.setSceneObjects()

let scene = mainScene.scene

// ===================================================================
// ===================================================================
// ===================================================================

// renderer
let renderer = mainScene.renderer

// camera 
let camera = mainScene.camera
let cameraFocus = mainScene.cameraFocus

// controls to move the scene
let controls = mainScene.controls

let mouseoverState = ""

// What stays in this file? ------------------------------------------

// clock used to track time deltas

let clock = new THREE.Clock()
let clockDelta

// help track mouse movement events

var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

// animation mixers array - https://www.mixamo.com - for more animations and models

let mixers = []

// Add stars
Array(2000).fill().forEach(addStar)

let sceneStates = mainScene.sceneStates

let sceneState = sceneStates.landing

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
}

// TODO: Move to new file
// background star effect
function addStar() {
	const geometry = new THREE.SphereGeometry(.5, 24, 24);
	const material = new THREE.MeshStandardMaterial({color:0xffffff});
	const star = new THREE.Mesh(geometry, material);

	const [x, y, z] = Array(3).fill().map(()=> THREE.MathUtils.randFloatSpread(1000));
	star.position.set(x,y,z);
	scene.add(star);
}

function log(text) {
	console.log("\n" + text)
}

// move camera and controls to new scene location
function animateToScene(sceneName) {
	console.log("\nanimateToScene: " + sceneName)
	console.log(sceneStates[sceneName])
	let scenePosition = sceneStates[sceneName].cameraPosition
	let controlsTargetVector = sceneStates[sceneName].controlsTargetVector

	// tween test area
	var controlsPosition = { x : controls.target.x, y: controls.target.y, z: controls.target.z}
	var controlsTarget = { x : controlsTargetVector[0], y: controlsTargetVector[1], z: controlsTargetVector[2]}
	var controlsTween = new TWEEN.Tween(controlsPosition).to(controlsTarget, 1500)

	controlsTween.onUpdate(function() {
		controls.target.x = controlsPosition.x
		controls.target.y = controlsPosition.y
		controls.target.z = controlsPosition.z
	})

	controlsTween.start()
	console.log("\n controls.target")
	console.log(controls.target)
	// controls.target = new THREE.Vector3(controlsTargetVector[0], controlsTargetVector[1], controlsTargetVector[2])

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
	tween3.onComplete(sceneStates[sceneName].callback)

	sceneState = sceneStates[sceneName]
}

function animate() {
	requestAnimationFrame(animate)

	clockDelta = clock.getDelta()

	TWEEN.update()

	currentScene.animateScene(clockDelta)

	updateMixers(clockDelta)
	controls.update()

	renderer.render(currentScene.scene, camera)
}

animate()