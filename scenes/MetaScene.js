import * as THREE from 'three'
import { DoubleSide } from 'three'
import ParentScene from './ParentScene'
import SceneController from '../helpers/SceneController'

export default class MetaScene extends ParentScene {
    constructor(config) {
        super(config)
        this.isLoaded = false
        this.setSceneStates()
        let sceneController = new SceneController()
        sceneController.testLogs()
        sceneController.switchScene("test 1")
        sceneController.loadScene("test 2")
        this.addSpaceTravel()
    }

    setSceneObjects() {
        if(this.isLoaded == false) {
            this.loadGLTF(this.scene, '/ready-player-jake.glb', 'rp-jake', 1, {x: 0, y: 0, z: 0}, false, 0, 0, 0)
            this.isLoaded = true
        }
    }
 
    // comment here
    setSceneStates() {
        let sceneStates = {
            landing: {
              name: "reality-labs",
              cameraPosition: [0, 12, 80],
              controlsTargetVector: [0, 0, -20]
            },
            inventory: {
              name: "portal",
              cameraPosition: [63, 6, 50],
              controlsTargetVector: [0, 0, -20],
            }
          }
        this.sceneStates = sceneStates
    }

    // pearl electron and metaverse header for now
    setMetaverseLogo() {
        let optimerBoldUrl = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json'
        let metaverseHeader = ''
        let headerScale = 1.5
        let headerTranslation = [-5, 5, 60]
        if(window.innerWidth > 700) {
            metaverseHeader = 'Reality Labs'
        } else {    
            metaverseHeader = "Mobile coming soon"
            headerScale = 1.2
            headerTranslation = [-8, 0, 45]
        }
        
        this.loadText(optimerBoldUrl, 'metaverse-header', metaverseHeader, headerScale,  .2, headerTranslation, true, 0, 0, 0)
    }

    // space
    addSpaceTravel() {
        // star geometry and material
        const starCount = 10000
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(starCount * 3)
        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 1000; // Random position within a 1000x1000x1000 cube
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const material = new THREE.PointsMaterial({
            color: 0x00aaff,
            size: 0.5,
            transparent: true,
            alphaTest: 0.5, // This will discard fragments with alpha less than 0.5, making the points appear as circles
            depthWrite: false // This can help with transparency issues
        })


        const stars = new THREE.Points(geometry, material)
        this.starCount = starCount
        this.stars = stars
        this.scene.add(stars)
    }

    animateStars() {
        var stars = this.stars
        var starCount = this.starCount
        // Update star positions
        const positions = stars.geometry.attributes.position.array
         // i = 0 = x axis, i = 1 = y axis, i = 2 = z axis
        for (let i = 2; i < starCount * 3; i += 3) {
            positions[i] += 1; // Move raindrops down
            if (positions[i] > 500) positions[i] = -500; // Reset position when it goes out of bounds
        }
        stars.geometry.attributes.position.needsUpdate = true
    }

    // comment here
    animateScene(clockDelta) {
        this.rotateObject('rp-jake', [0, .0025, 0])
        this.animateStars()
    }
}