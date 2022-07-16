import './style.css'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import MainScene from './scenes/MainScene'
import WilderWorldScene from './scenes/WilderWorldScene'
import MetaScene from './scenes/MetaScene'
import LoadingScene from './scenes/LoadingScene'
import InventoryScene from './scenes/InventoryScene'
import SandboxScene from './scenes/SandboxScene'
import RequestManager from './helpers/RequestManager'

let windowInnerHeight, windowInnerWidth, scaleMultiplyer = 0

// Make a networking library to make requests ------------
// let cocktailDbAPI = {
// 	url: "https://the-cocktail-db.p.rapidapi.com/filter.php?i=Gin",
// 	headers: {
// 		'X-RapidAPI-Key': 'a993df2f98mshe5438db55516542p15a443jsn546b669c1e62',
// 		'X-RapidAPI-Host': 'the-cocktail-db.p.rapidapi.com'
// 	}
// }

// let requestConfig = {
// 		url: cocktailDbAPI.url,
// 		method: "GET",
// 		headers: cocktailDbAPI.headers
// }
// let requestManager = new RequestManager()
// requestManager.makeRequest(requestConfig)
// console.log("\nwe did it")
// console.log(requestManager)

// document event listeners
document.addEventListener('keydown', keyDownHandler, false)
document.addEventListener('mousedown', onDocumentMouseDown, false)

// scaleMultiplier is used to change object size based on window width
function updateScaleMultiplier() {
	windowInnerWidth = window.innerWidth
	if(windowInnerWidth < 700) {
		scaleMultiplyer = .5
	} else {
		scaleMultiplyer = 1
	}
}
updateScaleMultiplier()

//if the user resizes the window you have to adjust the scene to fit within it
window.addEventListener('resize', function() {
	windowInnerHeight = window.innerHeight
	windowInnerWidth = window.innerWidth
	console.log("\nWidth: " + windowInnerWidth)
	renderer.setSize(windowInnerWidth, windowInnerHeight);
	camera.aspect = windowInnerWidth / windowInnerHeight;
	camera.updateProjectionMatrix();
	updateScaleMultiplier()
})

// On click events

// main menu click events - move to it's own file and load the menu independently
const items = document.querySelectorAll('ul > li')
	items.forEach(item => {
			item.addEventListener('click',(e)=>{
			// console.log(e.target.textContent)
			console.log(e.target)
			handleMenuEvent(e.target)
		}
	)
})

// main scene
let mainSceneConfig = {
	name: "main-scene",
	gui: false, // TODO: fix bug with gui
	gridFloor: false,
	torusGroup: false,
	focusTorus: false,
	background: ''
}

// meta scene
let metaSceneConfig = {
	name: "meta-scene",
	gui: false, // TODO: fix bug with gui
	background: '',
	gridFloor: true
}

// inventory scene
let inventorySceneConfig = {
	name: "inventory-scene",
	gui: false, // TODO: fix bug with gui
	background: '',
	gridFloor: false,
	// background: './assets/wiami-bg.jpeg'
}

// loading scene
let loadingSceneConfig = {
	name: "loading-scene",
	gui: false, // TODO: fix bug with gui
	background: '',
	gridFloor: true
}

// loading scene
let sandboxSceneConfig = {
	name: "sandbox-scene",
	gui: false, // TODO: fix bug with gui
	background: '',
	gridFloor: true
}

let mainScene = new MainScene(mainSceneConfig)
let metaScene = new MetaScene(metaSceneConfig)
let inventoryScene = new InventoryScene(inventorySceneConfig)
// let loadingScene = new LoadingScene(loadingSceneConfig)
let sandboxScene = new SandboxScene(loadingSceneConfig)

let currentScene = mainScene
currentScene.setSceneObjects()

let scene = mainScene.scene

// renderer
let renderer = mainScene.renderer

// camera 
let camera = mainScene.camera
let cameraFocus = mainScene.cameraFocus

// controls to move the scene
let controls = mainScene.controls

// What stays in this file? ------------------------------------------

// clock used to track time deltas

let clock = new THREE.Clock()
let clockDelta

// help track mouse movement events

var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

// animation mixers array - https://www.mixamo.com - for more animations and models

let mixers = []

function buildBoxGeometry(scaleX = 1, scaleY = 1, scaleZ = 1, texture = new THREE.MeshBasicMaterial()) {
	return new THREE.Mesh(
		new THREE.BoxGeometry(scaleX,scaleY,scaleX),
		new THREE.MeshBasicMaterial({map: texture})
	)
}

// set positions - figure out why I need this :sweat-smile:
currentScene.updateCameraPosition([0, 18, 90], 50, 1)

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
		console.log(object)
	}
}

// handleMenuEvent is for the main navbar
function handleMenuEvent(itemSelected) {
	let textContent = itemSelected.textContent
	console.log(itemSelected)
	var currentMenuItem = document.getElementsByClassName('menu-selected')
	currentMenuItem[0].classList.remove("menu-selected")
	if(textContent == "Meta") { // todo primary
		currentScene = metaScene
	} else if(textContent == "Kaizen") {
		currentScene = mainScene
	} else if(textContent == "Loading") {
		currentScene = loadingScene
	} else if(textContent == "Clubhouse") {
		currentScene = inventoryScene
	} else if(textContent == "Sandbox") {
		currentScene = sandboxScene
	}
	resetCamera()
	if(!currentScene.isLoaded) {
		currentScene.setSceneObjects()
	}
	itemSelected.classList.add("menu-selected")
}

function log(text) {
	console.log("\n" + text)
}

function keyDownHandler(event) {
	switch (event.keyCode) {
	case 87: // w
		break
	case 65: // a
		break
	case 83: // s
		break
	case 68: // d
		break
	case 38: // up
		break
	case 37: // left
		leftKeyHandler()
		break
	case 40: // down
		break
	case 39: // right
		rightKeyHandler()
		break
	case 13: // enter
		enterKeyHandler()
		break
	case 27: // escape
		resetCamera()
		break
	}
}

function enterKeyHandler() {
	scene = new WilderWorldScene(mainSceneConfig)
	if(sceneState.name == 'landing') {
	}
	// currentScene.toggleGridFloor()
}

function rightKeyHandler() {
	if(sceneState.name == 'landing') {
	}
}

function leftKeyHandler() {
	if(sceneState.name == 'landing') {
	}
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