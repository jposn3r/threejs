import * as THREE from 'three'
import ParentScene from './ParentScene'

export default class MetaScene extends ParentScene {
    constructor(config) {
        super(config)
        this.isLoaded = false
        this.setSceneStates()
        this.setMetaverseLogo()
    }

    setSceneObjects() {
        if(this.isLoaded == false) {
            this.loadGLTF(this.scene, '/oculus-quest-2/scene.gltf', 'quest-2', 50, {x: 0, y: 14, z: 20}, false, 0.1, 0, 0)
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

    // comment here
    animateScene(clockDelta) {
        this.rotateObject('quest-2', [0, .0025, 0])
    }
}