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
// 

export default class LoadingScene {

    constructor(config) {
        console.log(config)
        // read config values
        this.name = config.name
        var gridFloor = config.gridFloor
        var gui = config.gui
        var background = config.background

        this.setScene()
        this.setCamera()
        this.setRenderer()
        this.setControls()
        this.setGui(gui)
        this.setLights()

        // metaverse floor grid
        if(gridFloor == true) {
            this.addGridFloor()
        }

        if(background !== "") {
            this.setBackground(config.background)
        }
        this.setSceneStates()
        this.setMetaverseLogo()
    }

    // comment here
    setScene() {
        // main scene
        console.log("setScene()")
        var scene = new THREE.Scene()
        scene.name = "main"
        this.scene = scene
    }

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

    // comment here
    setCamera(){
        // camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.name = "camera-1"
        this.cameraFocus = "origin"
    }

    // comment here
    setControls() {
        // controls
        // let controls = new OrbitControls(camera, renderer.domElement)
        // let controls = new MapControls(camera, renderer.domElement)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    }

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

    // comment here
    setLights() {
        // lights
        this.lights = []
        this.addLightToScene("ambient", "ambient-light")
        this.addLightToScene("point", "point-light-1", 0xffffff, [0, 10, 30], 3, 0)
        // this.addLightToScene("point", "point-light-2", 0xffffff, [0, -20, 40], 3, 0)
    }
 
    // comment here
    setSceneStates() {
        let sceneStates = {
            landing: {
              name: "landing",
              cameraPosition: [0, 12, 80],
              controlsTargetVector: [0, 0, -20]
            }
          }
        this.sceneStates = sceneStates
    }

    // load 3d text - this should be somewhere else to be used by every scene
    loadText(fontUrl, name, text, size, height, position, shadow, xRotation = 0, yRotation = 0, zRotation = 0, visible = true) {
        let loader = new FontLoader()
        let scene = this.scene
        
        loader.load(fontUrl, addFontToScene)
        function addFontToScene(font) {
            const geometry = new TextGeometry(text, {
                font: font,
                size: size,
                height: height,
              })
              const textMesh = new THREE.Mesh(geometry, [
                new MeshPhongMaterial({ color: 0xffffff}),
                new MeshPhongMaterial({ color: 0x000000}),
              ])
              textMesh.name = name
              textMesh.castShadow = shadow
              textMesh.position.set(position[0], position[1], position[2])
              textMesh.rotation.set(xRotation, yRotation, zRotation)
              textMesh.visible = visible
              scene.add(textMesh)
        }
    }

    // pearl electron and metaverse header for now
    setMetaverseLogo() {
        let optimerBoldUrl = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json'
        let metaverseHeader = ''
        let headerScale = 2
        let headerTranslation = [-16, 0, 45]
        if(window.innerWidth > 700) {
            metaverseHeader = 'Loading into the Metaverse'
        } else {    
            metaverseHeader = "Mobile coming soon"
            headerScale = 1.2
            headerTranslation = [-8, 0, 45]
        }
        
        this.loadText(optimerBoldUrl, 'loading-header', metaverseHeader, headerScale,  .2, headerTranslation, true, 0, 0, 0)
        // add pearl electron (40, 22, -10)
        // let pearlElectronResourceUrl = './models/pearl-electron/scene.gltf'
        // this.loadGLTF(pearlElectronResourceUrl, 'pearl-electron', 9, {x: 40, y: 22, z: -13}, true)
    }

    // comment here
    setBackground(asset) {
        let spaceTexture = new THREE.TextureLoader().load(asset)
        this.scene.background = spaceTexture
    }

    // comment here
    addToGui(field, name, folder = "") {
        if(folder !== "") {
            // check if folder exists

            // if it doesn't add a new folder
            // this.gui.addFolder("folder-name")
        }

        this.gui.add(field, name)
    }

    // comment here
    animateScene() {
        this.rotateObject('planet-earth', [.0005, .0004, 0])
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
}