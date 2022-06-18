import * as THREE from 'three'
import ParentScene from './ParentScene'

export default class MainScene extends ParentScene {
    constructor(config) {
        super(config)
        // read config values
        var torusGroup = config.torusGroup
        var focusTorus = config.focusTorus

        if(torusGroup == true) {
            this.addTorusGroupToScene()
        }
        if(focusTorus == true) {
            this.addFocusTorus()
        }
        this.setSceneStates()
        this.setMetaverseLogo()
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
        let headerTranslation = [-16, 0, 45]
        if(window.innerWidth > 700) {
            metaverseHeader = 'Welcome to the Metaverse'
        } else {    
            metaverseHeader = "Mobile coming soon"
            headerScale = 1.2
            headerTranslation = [-8, 0, 45]
        }
        
        this.loadText(optimerBoldUrl, 'metaverse-header', metaverseHeader, headerScale,  .2, headerTranslation, true, 0, 0, 0)
    }

    // comment here
    addTorusGroupToScene() {
        // build and add torus rings
        let torusGroup = new THREE.Group()

        let geometry = new THREE.TorusGeometry(9, 0.5, 10, 100)
        let blueMaterial = new THREE.MeshStandardMaterial({ color: 0x00dadf})

        let torus = new THREE.Mesh(geometry, blueMaterial)
        let torus2 = new THREE.Mesh(geometry, blueMaterial)
        let torus3 = new THREE.Mesh(geometry, blueMaterial)

        this.torus = torus
        this.torus2 = torus2
        this.torus3 = torus3

        torusGroup.add(this.torus)
        torusGroup.add(this.torus2)
        torusGroup.add(this.torus3)
        torusGroup.name = "torus-group"

        torusGroup.position.set(40, 22, -10)

        this.torusGroup = torusGroup
        this.scene.add(torusGroup)
    }

    // comment here
    addFocusTorus() {
        // focus torus
        let focusTorusGeometry = new THREE.TorusGeometry(5, 0.25, 5)
        let focusTorusMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff})
        let focusTorus = new THREE.Mesh(focusTorusGeometry, focusTorusMaterial)

        focusTorus.rotation.x = -1.575
        focusTorus.rotation.y = 0
        focusTorus.rotation.z = 0

        focusTorus.position.set(0, 0, 41)

        this.focusTorus = focusTorus

        this.scene.add(focusTorus)
    }

    // animate torus group rotations
    animateTorusGroup() {
        if(this.getObjectByName("torus-group")) {
            this.torus.rotation.x += 0.01
            this.torus.rotation.y += 0.01
            this.torus.rotation.z += 0.01
            
            this.torus2.rotation.x -= 0.02
            this.torus2.rotation.y -= 0.02
            this.torus2.rotation.z -= 0.02
            
            this.torus3.rotation.x -= 0.02
            this.torus3.rotation.y += 0.02
            this.torus3.rotation.z -= 0.02
        }
    }

    // comment here
    animateScene(clockDelta) {
        this.animateTorusGroup()
        this.rotateObject('planet-earth', [.0005, .0004, 0])
    }
}