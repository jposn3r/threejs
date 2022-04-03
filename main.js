import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AnimationObjectGroup, MeshPhongMaterial, Vector3 } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import TWEEN from '@tweenjs/tween.js'
import MainScene from './scenes/MainScene'
import WilderWorldScene from './scenes/WilderWorldScene'

// document event listeners
let windowInnerHeight, windowInnerWidth, scaleMultiplyer = 0
var leftDetailPanel = document.getElementById("left-detail-panel")

hideDetailPanels()

function updateScaleMultiplier() {
	windowInnerWidth = window.innerWidth
	if(windowInnerWidth < 700) {
		scaleMultiplyer = .5
	} else {
		scaleMultiplyer = 1
	}
}
updateScaleMultiplier()

window.addEventListener('resize', function() {
	windowInnerHeight = window.innerHeight
	windowInnerWidth = window.innerWidth
	console.log("\nWidth: " + windowInnerWidth)
	renderer.setSize(windowInnerWidth, windowInnerHeight);
	camera.aspect = windowInnerWidth / windowInnerHeight;
	camera.updateProjectionMatrix();
	updateScaleMultiplier()
	updateDetailPanelVisibility(windowInnerWidth)
})

function updateDetailPanelVisibility(windowInnerWidth) {
	if(windowInnerWidth < 700) {
		hideDetailPanels()
	} else {
		showDetailPanels()
	}
}
function hideDetailPanels() {
	// leftDetailPanel.style.display = 'none'
}

function showDetailPanels() {
	console.log("showDetailPanels")
	console.log(sceneState)
	if(sceneState.name == 'inventory') {
		leftDetailPanel.style.display = 'block'
	}
}

document.addEventListener('keydown', keyDownHandler, false)
document.addEventListener('mousedown', onDocumentMouseDown, false)

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
let mainScene = new MainScene(mainSceneConfig)
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

let masterChiefResourceUrl = './models/halo-infinite-master-chief-rigged-walk./scene.gltf'
let astronautResourceUrl = './models/astronaut/scene.gltf'

// set positions - figure out why I need this :sweat-smile:
updateCameraPosition([0, 18, 90], 50, 1)

// Add stars
Array(2000).fill().forEach(addStar)

let sceneStates = mainScene.sceneStates

let sceneState = sceneStates.landing

// Master Chief Walking
// loadGLTF(masterChiefResourceUrl, 'master-chief', 6.5, {x: 40, y: 0, z: 0}, true, 0, 1.5)
// load spaceman
// loadGLTF(astronautResourceUrl, 'astronaut', 7, {x: 0, y: 0, z: 50}, true, 0, 0, 0, function(){}, 3)

// load intitial layout into focus area
function loadLanding() {
	if(windowInnerWidth > 700) {
		loadGLTF('./models/planet-earth/scene.gltf', 'planet-earth', 5, {x: -60, y: -15, z: -100}, true, 0, 0)
		loadGLTF('./models/portal-night-version/scene.gltf', 'portal', .005, {x: 0, y: 0, z: 30}, true, 0, 1.5)
		loadGLTF('./models/rhetorician/scene.gltf', 'rhetorician', 7.5, {x: 50, y: -20, z: 0}, true, 0, .5)
		
	} else {
		loadGLTF('./models/portal-night-version/scene.gltf', 'portal', .003, {x: 0, y: 0, z: 30}, true, 0, 1.5)
	}
}
loadLanding()

// GLTF Loader function
function loadGLTF(resourceUrl, name, scale, position, animate, xRotation = 0, yRotation = 0, zRotation = 0, callback = function() {console.log("no callback")}, animationIndex = 0, timeScale = 1) {
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
			console.log(timeScale)
			action.timeScale = timeScale
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
	)
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
function loadText(fontUrl, name, text, size, height, position, shadow, xRotation = 0, yRotation = 0, zRotation = 0, visible = true) {
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
		textMesh.rotation.set(xRotation, yRotation, zRotation)
		textMesh.visible = visible
		scene.add(textMesh)
	})
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

function handleMenuEvent(itemSelected) {
	let textContent = itemSelected.textContent
	console.log(itemSelected)
	var currentMenuItem = document.getElementsByClassName('menu-selected')
	currentMenuItem[0].classList.remove("menu-selected")
	if(textContent == "Inventory") {
		showDetailPanels()
		animateToScene("inventory")
	} else if(textContent == "Home") {
		resetCamera()
	}
	itemSelected.classList.add("menu-selected")
}

function keyDownHandler(event) {
	switch (event.keyCode) {
	case 87: // w
		break
	case 65: // a
		
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
	mainScene.toggleGridFloor()
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
	tween3.onComplete(sceneStates[sceneName].callback)

	sceneState = sceneStates[sceneName]
}

// update camera position

function updateCameraPosition(position = [0, 20, 75], fov = 50, zoom = 1) {
	camera.position.set(position[0], position[1], position[2])
	camera.fov = fov
	camera.zoom = zoom
	camera.updateProjectionMatrix()
}

function animate() {
	requestAnimationFrame(animate)

	clockDelta = clock.getDelta()

	TWEEN.update()

	mainScene.animateScene()

	updateMixers(clockDelta)
	controls.update()

	renderer.render(scene, camera)
}

animate()