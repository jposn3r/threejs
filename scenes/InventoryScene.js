import * as THREE from 'three'
import ParentScene from './ParentScene'

export default class InventoryScene extends ParentScene {
    constructor(config) {
        super(config)
        // read config values
        var torusGroup = config.torusGroup
        var focusTorus = config.focusTorus
        let isLoaded = false
        this.isLoaded = isLoaded

        if(torusGroup == true) {
            this.addTorusGroupToScene()
        }
        if(focusTorus == true) {
            this.addFocusTorus()
        }
        this.setSceneStates()
        this.setMetaverseLogo()
    }
 
    // comment here - are these values used at all?
    setSceneStates() {
        let sceneStates = {
            inventoryLanding: {
              name: "inventory-landing",
              cameraPosition: [0, 20, 80],
              controlsTargetVector: [0, 0, 40],
            }
          }
        this.sceneStates = sceneStates
    }

    // comment here
    setSceneObjects() {
        if(this.isLoaded == false) {
            this.isLoaded = true

            // Parking lot
            this.loadGLTF(this.scene, '/parking-garage/scene.gltf', 'parking-garage-center', 10, {x: 0, y: 0, z: -5}, false, 0, 1.5, 0)

            // Bikes
            this.loadGLTF(this.scene, '/akira-bike/scene.gltf', 'akira-bike', 16, {x: 1, y: 37, z: -17}, false, 0, 1, 0)
            this.loadGLTF(this.scene, '/scifi-moto/scene.gltf', 'scifi-moto', .045, {x: -8, y: 8.1, z: -7}, false, 0, 1, 0)
            this.loadGLTF(this.scene, '/harley-davidson_police/scene.gltf', 'moto-bike', .015, {x: -30, y: 0, z: -7}, false, 0, -0.5, 0)
            this.loadGLTF(this.scene, '/tron-moto/scene.gltf', 'tron-moto', 4.8, {x: 32, y: 0, z: -4}, false, 0, -0.55, 0)

            // add cubes
            let wilderLogoUri = "wilder-white-black-logo.jpeg"
            this.addCube("cube-1", wilderLogoUri, 15, 15, 15, [-45,30,-50], [0, .6, 0])
            this.addCube("cube-2", wilderLogoUri, 15, 15, 15, [45,30,-50], [0, -.6, 0])
        }
        
    }

    // comment here
    setLights() {
        // lights
        this.lights = []
        this.addLightToScene("ambient", "ambient-light")
        this.addLightToScene("point", "point-light-1", 0xffffff, [-10, 5, 30], 2, 0)
        // add more lights
        this.addLightToScene("point", "point-light-red", 0xff0000, [50, 5, -100], 4, 500)
    }

    // pearl electron and metaverse header for now
    setMetaverseLogo() {
        // let optimerBoldUrl = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json'
        let optimerBoldUrl = 'https://threejs.org/examples/fonts/gentilis_bold.typeface.json'
        let metaverseHeader = ''
        let headerScale = 4.5
        let headerTranslation = [-23, 0, 42]
        if(window.innerWidth > 700) {
            metaverseHeader = 'The WILD Riders'
        } else {    
            metaverseHeader = "Mobile coming soon"
            headerScale = 1
            headerTranslation = [-8, 0, 45]
        }
        
        this.loadText(optimerBoldUrl, 'metaverse-header', metaverseHeader, headerScale,  .2, headerTranslation, true, 0, 0, 0)

        // riders -----------------------------------------------------
        // let nameHeaderScale = 1
        // let jakoniusHeader = "Jakonius"
        // this.loadText(optimerBoldUrl, 'jakonius-header', jakoniusHeader, nameHeaderScale,  .2, [-11, 1, 53], true, 0, 0, 0)

        // let fitchesHeader = "Fitches"
        // this.loadText(optimerBoldUrl, 'jakonius-header', fitchesHeader, nameHeaderScale,  .2, [-5, 1, 53], true, 0, 0, 0)

        // let ardentHeader = "Ardent"
        // this.loadText(optimerBoldUrl, 'jakonius-header', ardentHeader, nameHeaderScale,  .2, [.7, 1, 53], true, 0, 0, 0)

        // let castorTroyHeader = "CastorTroy"
        // this.loadText(optimerBoldUrl, 'jakonius-header', castorTroyHeader, nameHeaderScale,  .2, [5.5, 1, 53], true, 0, 0, 0)
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
        // this.animateTorusGroup()
        this.rotateObject('death-star', [.0005, -.0004, 0])
        this.rotateObject('cube-1', [.005, -.004, 0])
        this.rotateObject('cube-2', [.005, -.004, 0])
        
        this.updateMixers(clockDelta)
    }
}