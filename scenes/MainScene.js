import * as THREE from 'three'
import ParentScene from './ParentScene'
import TabletSurface from '../components/Tablet/TabletSurface'

export default class MainScene extends ParentScene {
    constructor(config) {
        super(config)
        // read config values
        this.isLoaded = false
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
        this.initTablet()
    }

    initTablet() {
        let config = {
            headerText: "Welcome to the Metaverse",
            destinations: ["Kaizen", "Meta", "Clubhouse", "Sandbox"],
            dataSources: ["Twitter", "Google"],
            translation: [10, 5, 45]
        }
        const tabletSurface = new TabletSurface(config)
        // this.scene.add(tabletSurface.tabletSurfaceGroup) // uncomment to continue testing, still need to make one tablet accessible to all scenes somehow
    }

    setSceneObjects() {
        if(this.isLoaded == false) {
            this.isLoaded = true

            // load intitial layout into focus area
            if(window.innerWidth > 700) {
                this.loadGLTF(this.scene, '/planet-earth/scene.gltf', 'planet-earth', 5, {x: -60, y: -15, z: -100}, true, 0, 0)
                this.loadGLTF(this.scene, '/portal-night-version/scene.gltf', 'portal', .005, {x: 0, y: 0, z: 30}, true, 0, 1.5)
                this.loadGLTF(this.scene, '/death-star/scene.gltf', 'death-star', .5, {x: 80, y: 20, z: -80}, false, 1, 0, 0)
                
            } else {
                this.loadGLTF(this.scene, '/portal-night-version/scene.gltf', 'portal', .003, {x: 0, y: 0, z: 30}, true, 0, 1.5)
            }
        }
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
        // make the death star orbit the earth - https://en.threejs-university.com/2021/08/04/satellite-placing-a-3d-object-into-orbit-around-a-target/
        this.rotateObject('planet-earth', [.0005, .0004, 0])
        this.rotateObject('death-star', [-.0005, -.0004, 0])
        this.updateMixers(clockDelta)
    }
}