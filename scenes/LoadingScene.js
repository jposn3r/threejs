import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AnimationObjectGroup, MeshPhongMaterial, Vector3 } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import TWEEN from '@tweenjs/tween.js'
import ParentScene from './ParentScene'

// Notes
// 

export default class LoadingScene extends ParentScene {

    constructor(config) {
        super(config)
        console.log(config)
        // read config values

        this.setLights()

        this.setSceneStates()
        this.setMetaverseLogo()
        this.setSceneObjects()
    }

    setSceneObjects() {
        this.portalSample = this.loadGLTF(this.scene, './models/portal-night-version/scene.gltf', 'portal', .005, {x: 0, y: 0, z: 30}, true, 0, 1.5)
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
}