import * as THREE from 'three'
import ParentScene from './ParentScene'
import TWEEN from '@tweenjs/tween.js'

export default class MainScene extends ParentScene {
    constructor(config) {
        super(config)
        // read config values
        this.isLoaded = false
        this.setSceneStates()
        this.setMetaverseLogo()
        console.log("Main Scene incoming")
    }

    setSceneObjects() {

    }
 
    // comment here
    setSceneStates() {
        let sceneStates = {
            landing: {
              name: "landing",
              cameraPosition: [0, 12, 80],
              controlsTargetVector: [0, 0, -20]
            },
            wilderWorld: {
              name: "wilder-world",
              cameraPosition: [0, 6, -175],
              controlsTargetVector: [0, 8, -200],
            //   callback: onWilderWorldLoaded
            },
            inventory: {
              name: "inventory",
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
        let headerScale = 2
        let headerTranslation = [-12, 0, 45]

        if(window.innerWidth > 700) {
            metaverseHeader = 'Explore the Metaverse'
        } else {    
            metaverseHeader = "Mobile coming soon"
            headerScale = 1.2
            headerTranslation = [-8, 0, 45]
        }
        
        this.loadText(optimerBoldUrl, 'metaverse-header', metaverseHeader, headerScale,  .2, headerTranslation, true, 0, 0, 0)
    }

    // comment here
    animateScene(clockDelta) {
        this.updateMixers(clockDelta)
    }

    handleClick(name) {

    }
}