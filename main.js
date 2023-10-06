import './style.css'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import MetaScene from './scenes/MetaScene'
import SceneController from './helpers/SceneController'

// What should main do?
// initiate scene controller

let windowInnerHeight = window.innerHeight
let windowInnerWidth =  window.innerWidth

// if(windowInnerWidth < 600) {
// 	console.log("mobile bro")
// 	// Create new button elements
// 	var leftButton = document.createElement("button")
// 	var rightButton = document.createElement("button")

// 	// Set their IDs
// 	leftButton.setAttribute("id", "left-button")
// 	rightButton.setAttribute("id", "right-button")

// 	// Set their text
// 	leftButton.innerText = "Open Left"
// 	rightButton.innerText = "Open Right"

// 	// Append the buttons to the container
// 	var container = document.querySelector(".container")
// 	container.appendChild(leftButton)
// 	container.appendChild(rightButton)
// 	document.getElementById('left-button').addEventListener('click', function() {
// 		document.getElementById('left-box').style.transform = 'translateX(0)'
// 		document.getElementById('right-box').style.transform = 'translateX(100%)'
// 	})
	  
// 	document.getElementById('right-button').addEventListener('click', function() {
// 		document.getElementById('right-box').style.transform = 'translateX(0)'
// 		document.getElementById('left-box').style.transform = 'translateX(-100%)'
// 	})
// }

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
// ===================================================================\

let sceneController = new SceneController()

// meta scene
let metaSceneConfig = {
	name: "meta-scene",
	gui: false,
	background: '',
	gridFloor: false
}

let mainScene = new MetaScene(metaSceneConfig)

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
// let controls = mainScene.controls

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
// Array(2000).fill().forEach(addStar)

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
	// cameraFocus = "origin"
	// animateToScene("landing")
}

// TODO: Move to new file
// background star effect
// function addStar() {
// 	const geometry = new THREE.SphereGeometry(.5, 24, 24);
// 	const material = new THREE.MeshStandardMaterial({color:0xffffff});
// 	const star = new THREE.Mesh(geometry, material);

// 	const [x, y, z] = Array(3).fill().map(()=> THREE.MathUtils.randFloatSpread(1000));
// 	star.position.set(x,y,z);
// 	scene.add(star);
// }

// move this to scene controller

// move camera and controls to new scene location
function animateToScene(sceneName) {
	console.log("\nanimateToScene: " + sceneName)
	console.log(sceneStates[sceneName])
	let scenePosition = sceneStates[sceneName].cameraPosition
	// let controlsTargetVector = sceneStates[sceneName].controlsTargetVector

	// tween test area
	// var controlsPosition = { x : controls.target.x, y: controls.target.y, z: controls.target.z}
	// var controlsTarget = { x : controlsTargetVector[0], y: controlsTargetVector[1], z: controlsTargetVector[2]}
	// var controlsTween = new TWEEN.Tween(controlsPosition).to(controlsTarget, 1500)

	// controlsTween.onUpdate(function() {
	// 	controls.target.x = controlsPosition.x
	// 	controls.target.y = controlsPosition.y
	// 	controls.target.z = controlsPosition.z
	// })

	// controlsTween.start()
	// console.log("\n controls.target")
	// console.log(controls.target)
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

// move this to scene controller

function animate() {
	requestAnimationFrame(animate)

	clockDelta = clock.getDelta()

	TWEEN.update()

	currentScene.animateScene(clockDelta)

	updateMixers(clockDelta)
	// controls.update()

	renderer.render(currentScene.scene, camera)
}

animate()

let test = sceneController.getCurrentScene()