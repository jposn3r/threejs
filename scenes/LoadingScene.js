import * as THREE from 'three'
import ParentScene from './ParentScene'

// Notes

export default class LoadingScene extends ParentScene {

    constructor(config) {
        super(config)
        // read config values

        this.setSceneStates()
        this.setMetaverseLogo()
        this.setSceneObjects()
    }

    setSceneObjects() {
        this.portalSample = this.loadGLTF(this.scene, './models/portal-night-version/scene.gltf', 'portal', .005, {x: 0, y: 0, z: 30}, true, 0, 1.5)
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