import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AnimationObjectGroup, MeshPhongMaterial, Vector3 } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import * as dat from 'dat.gui'

export default class ParentScene {
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
        this.setLights()
    
        if(gridFloor == true) {
            this.addGridFloor()
        }

        if(background !== "") {
            this.setBackground(background)
        }
    }

    // SCENE

    setScene() {
        // main scene
        console.log("\nParentScene: setScene")
        var scene = new THREE.Scene()
        scene.name = "main"
        this.scene = scene
    }

    // set initial layout
    setSceneObjects() {
        console.log("setSceneObjects: parent")
    }

    // RENDERER

    setRenderer() {
        console.log("ParentScene: setRenderer")
        let renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#world'),
        })
            
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth, window.innerHeight)

        this.renderer = renderer
    }

    // CAMERA

    setCamera(){
        // camera
        console.log("ParentScene: setCamera")
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.name = "camera-1"
        this.cameraFocus = "origin"
        this.updateCameraPosition([0, 1, 2.9], 50, 1)
    }

    // update camera position
    updateCameraPosition(position = [0, 20, 75], fov = 50, zoom = 1) {
        console.log("\nParentScene: updateCameraPosition")
        var camera = this.camera
        camera.position.set(position[0], position[1], position[2])
        camera.fov = fov
        camera.zoom = zoom
        camera.updateProjectionMatrix()
    }

    // CONTROLS

    setControls() {
        // Youtube helpers
        // https://www.youtube.com/watch?v=C3s0UHpwlf8 - Basic Character Controls - 3rd person
        // 
        // controls
        // let controls = new OrbitControls(camera, renderer.domElement)
        // let controls = new MapControls(camera, renderer.domElement)
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    }

    // GUI 

    setGui(gui) {
        // gui
        console.log("ParentScene: setGui")
        var camera = this.camera
        if(gui) {
            let gui = new dat.GUI()
            gui.add(camera.position, 'x')
            gui.add(camera.position, 'y')
            gui.add(camera.position, 'z')

            gui.add(camera.rotation, 'x')
            gui.add(camera.rotation, 'y')
            gui.add(camera.rotation, 'z')

            this.gui = gui

            var camera = this.camera

            // add items to gui - why does this look weird?
            
        }
    }

    // OBJECTS

    loadGLTF(scene, resourceUrl, name, scale, position, animate, xRotation = 0, yRotation = 0, zRotation = 0, animationIndex = 0, timeScale = 1) {
        console.log("\nParentScene: loadGLTF: ", name)
        return new Promise((resolve) => {
            let mixer
            let loader = new GLTFLoader()
            let mixers = this.mixers
            let modelUrl = "https://jakonius-assets.s3.us-east-2.amazonaws.com/models"
            let animationsUrl = "https://jakonius-assets.s3.us-east-2.amazonaws.com/models/animations"

            loader.load(
                // resource URL
                modelUrl + resourceUrl,
                // called when the resource is loaded
                function (gltf) {
                    gltf.scene.scale.set(scale, scale, scale)

                    gltf.scene.name = name

                    gltf.scene.position.x = position.x
                    gltf.scene.position.y = position.y
                    gltf.scene.position.z = position.z

                    gltf.scene.rotation.x = xRotation
                    gltf.scene.rotation.y = yRotation
                    gltf.scene.rotation.z = zRotation

                    mixer = new THREE.AnimationMixer(gltf.scene)

                    if (animate) {
                        var action = mixer.clipAction(gltf.animations[animationIndex])
                        action.timeScale = timeScale
                        action.play()
                    }

                    scene.add(gltf.scene)
                    mixers.push(mixer)

                    // Resolve the promise after the model is added to the scene
                    resolve(gltf)

                },
                // called while loading is progressing
                function (xhr) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
                    if (xhr.loaded / xhr.total == 1) {
                        console.log("loading finished, proceed with operation")
                    }
                },
                // called when loading has errors
                function (error) {
                    console.log('An error happened loading GLTF model ' + name)
                }
            )
        })
    }


    // FBX Loader function
    loadFBX(resourceUrl, scale, position, animate, animationUrl) {
        console.log("ParentScene: loadFBX")
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
		    this.mixers.push(mixer)
	    })
    }

    moveObject(name, currentPosition, targetPosition, tweenDuration) {
        console.log("ParentScene: moveObject")
    }

    rotateObject(name, rotation = [0, 0, 0]) {
        //console.log("ParentScene: rotateObject", name)
        let object = this.getObjectByName(name)
        if(object !== undefined) {
            object.rotation.x += rotation[0]
            object.rotation.y += rotation[1]
            object.rotation.z += rotation[2]
        }
    }

    getObjectByName(name) {
        // console.log("ParentScene: getObjectByName", name)
        return this.scene.getObjectByName(name)
    }

    removeObjectByName(name) {
        console.log("ParentScene: removeObjectByName", name)
        return this.scene.remove(this.getObjectByName(name))
    }

    setBackground(asset) {
        console.log("ParentScene: setBackground", asset)
        let texture = new THREE.TextureLoader().load(asset)
        this.scene.background = texture
    }

     addGridFloor() {
        console.log("ParentScene: addGridFloor")
        let gridHelper = new THREE.GridHelper(100, 40, 0xffffff, 0x00dadf)
        gridHelper.name = "light-grid"
        this.scene.add(gridHelper)
    }

    toggleGridFloor() {
        console.log("\nParentScene: toggleGridFloor")
        var lightGrid = this.scene.getObjectByName('light-grid')
        lightGrid.visible = !lightGrid.visible
    }

    // load box geometry
    addCube(name, textureUri, height, width, depth, translation, rotation) {
        console.log("ParentScene: addCube", name)
        const geometry = new THREE.BoxGeometry( height, width, depth);
        const texture = new THREE.TextureLoader().load('./assets/' + textureUri)
        const material = new THREE.MeshBasicMaterial( {color: 0x00ffdd, map: texture} );
        const cube = new THREE.Mesh( geometry, material );
        cube.position.set(translation[0], translation[1], translation[2])
        cube.rotation.set(rotation[0], rotation[1], rotation[2])
        cube.name = name
        this.scene.add(cube)
    }


    // TEXT

     // load 3d text - this should be somewhere else to be used by every scene
     loadText(fontUrl, name, text, size, height, position, shadow, xRotation = 0, yRotation = 0, zRotation = 0, visible = true) {
        console.log("ParentScene: loadText", name)
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

    // LIGHTS

    setLights() {
        console.log("ParentScene: setLights")
        this.lights = []
        this.addLightToScene("ambient", "ambient-light")
        this.addLightToScene("point", "point-light-1", 0xffffff, [0, 15, 30], 2, 0)
        // this.addLightToScene("point", "point-light-2", 0xffffff, [0, -20, 40], 3, 0)
    }

    // comment here
    addLightToScene(type, name, color = 0xffffff, position = [0, 0, 0], intensity = 1, distance = 100, decay = 0) {
        console.log("ParentScene: addLightToScene", name)
        var lightObj = {}
        lightObj.name = name
        lightObj.type = type
        if(type == "ambient") {
            lightObj.light = new THREE.AmbientLight(color)
        } else if(type == "point") {
            lightObj.light = new THREE.PointLight(color, intensity, distance)
            lightObj.light.position.set(position[0], position[1], position[2])
        } else if(type == "directional") {
            lightObj.light = new THREE.DirectionalLight(color, intensity)
            
            lightObj.light.position.set(position[0], position[1], position[2])
        }
        this.lights.push(lightObj)
        this.scene.add(lightObj.light)
    }

    // ANIMATE

    animateScene(clockDelta) {
        console.log("ParentScene: animateScene")
        if(this.mixers) {
            this.updateMixers(clockDelta)
        }
    }

    setMixers() {
        console.log("ParentScene: setMixers")
        this.mixers = []
    }

    updateMixers(clockDelta) {
        // huge help in fixing the animations being slow! - https://discourse.threejs.org/t/too-slow-animation/2379/6
    
        // update mixers for animation
        for (let i = 0, l = this.mixers.length; i < l; i ++) {
            this.mixers[i].update(clockDelta)
        }
    }

    handleClick(name) {
        console.log("ParentScene: handleClick: " + name)
    }
}