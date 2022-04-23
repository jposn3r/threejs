import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AnimationObjectGroup, MeshPhongMaterial, Vector3 } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import TWEEN from '@tweenjs/tween.js'

// Notes

// What functionality does this need?
// create a scene, renderer, controls and camera

// add objects to the scene
// animate objects in the scene

// move the camera
// add multiple cameras
// switch cameras

// add text to the screen

// add shape to the screen

export default class ParentScene {
    // CONSTRUCTOR

    constructor(config) {
        var gridFloor = config.gridFloor
        var gui = config.gui
        var background = config.background
        this.name = config.name

        this.setScene()
        this.setCamera()
        this.setRenderer()
        this.setControls()
        this.setGui(gui)
        this.setMixers()
    
        if(gridFloor == true) {
            this.addGridFloor()
        }

        if(background !== "") {
            this.setBackground(config.background)
        }
    }

    // SCENE

    // comment here
    setScene() {
        // main scene
        console.log("\nparent scene set scene")
        var scene = new THREE.Scene()
        scene.name = "main"
        this.scene = scene
    }

    // set initial layout
    setSceneObjects() {
        console.log("setSceneObjects: parent")
    }

    // RENDERER

    // comment here
    setRenderer() {
        console.log("setRenderer()")
        let renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#world'),
        })
            
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth, window.innerHeight)

        this.renderer = renderer
    }

    // CAMERA

    // comment here
    setCamera(){
        // camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.name = "camera-1"
        this.cameraFocus = "origin"
    }

    // CONTROLS

    // comment here
    setControls() {
        // controls
        // let controls = new OrbitControls(camera, renderer.domElement)
        // let controls = new MapControls(camera, renderer.domElement)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    }

    // GUI 

    // comment here
    setGui(gui) {
        // gui
        if(gui) {
            let gui = new dat.GUI()
            this.gui = gui

            var camera = this.camera

            // add items to gui - why does this look weird?

            this.addToGui(camera.position, 'x')
            this.addToGui(camera.position, 'y')
            this.addToGui(camera.position, 'z')

            this.addToGui(camera.rotation, 'x')
            this.addToGui(camera.rotation, 'y')
            this.addToGui(camera.rotation, 'z')
        }
    }

    // OBJECTS

    loadGLTF(scene, resourceUrl, name, scale, position, animate, xRotation = 0, yRotation = 0, zRotation = 0, callback = function() {console.log("no callback")}, animationIndex = 0, timeScale = 1) {
        let mixer
        let loader = new GLTFLoader()
        let mixers = this.mixers

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
                // gltf.scene.callback = callback
                // console.log(gltf.scene.callback)

                scene.add(gltf.scene)
                mixers.push(mixer)
                return gltf
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

    moveObject() {

    }

    // comment here
    rotateObject(name, rotation = [0, 0, 0]) {
        let object = this.getObjectByName(name)
        if(object !== undefined) {
            object.rotation.x += rotation[0]
            object.rotation.y += rotation[1]
            object.rotation.z += rotation[2]
        }
    }

    // comment here
    getObjectByName(name) {
        return this.scene.getObjectByName(name)
    }

    // comment here
    removeObjectByName(name) {
        return this.scene.remove(this.getObjectByName(name))
    }

    // comment here
    setBackground(asset) {
        let texture = new THREE.TextureLoader().load(asset)
        this.scene.background = texture
    }

     // comment here
     addGridFloor() {
        // grid floor
        let gridHelper = new THREE.GridHelper(2000, 100, 0xffffff, 0x00dadf)
        gridHelper.name = "light-grid"
        this.scene.add(gridHelper)
    }

    // comment here
    toggleGridFloor() {
        console.log("\nthis happens yo")
        var lightGrid = this.scene.getObjectByName('light-grid')
        lightGrid.visible = !lightGrid.visible
    }

    // LIGHTS

    // comment here
    addLightToScene(type, name, color = 0xffffff, position = [0, 0, 0], intensity = 1, distance = 100, decay = 0) {
        var lightObj = {}
        lightObj.name = name
        lightObj.type = type
        if(type == "ambient") {
            lightObj.light = new THREE.AmbientLight(color)
        } else if(type == "point") {
            lightObj.light = new THREE.PointLight(color, intensity, distance)
            lightObj.light.position.set(position[0], position[1], position[2])
        }
        this.lights.push(lightObj)
        this.scene.add(lightObj.light)
    }

    // ANIMATE

    animateScene(clockDelta) {
        this.rotateObject('planet-earth', [.0005, .0004, 0])
        if(this.mixers) {
            this.updateMixers(clockDelta)
        }
    }

    setMixers() {
        this.mixers = []
    }

    updateMixers(clockDelta) {
        // huge help in fixing the animations being slow! - https://discourse.threejs.org/t/too-slow-animation/2379/6
    
        // update mixers for animation
        for (let i = 0, l = this.mixers.length; i < l; i ++) {
            this.mixers[i].update(clockDelta)
        }
    }


}