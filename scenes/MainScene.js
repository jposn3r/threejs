import * as THREE from 'three'
import ParentScene from './ParentScene'
import TabletSurface from '../components/Tablet/TabletSurface'
import TWEEN from '@tweenjs/tween.js'

export default class MainScene extends ParentScene {
    constructor(config) {
        super(config)
        // read config values
        this.isLoaded = false
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
                var testSphere = this.getSphereGeometry("test-sphere", 1, 32, 16, 0xff0000, [3, 4, 0])
                this.testSphere = testSphere
                this.scene.add(testSphere)
                this.loadGLTF(this.scene, '/planet-earth/scene.gltf', 'planet-earth', 2, {x: -60, y: 10, z: -100}, true, 0, 0)
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

    getSphereGeometry(name, radius, widthSegments, heightSegments, color, position) {
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const material = new THREE.MeshBasicMaterial({color: color});
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(position[0], position[1], position[2])
        sphere.name = name
        return sphere
    }

    // comment here
    animateScene(clockDelta) {
        // make the death star orbit the earth - https://en.threejs-university.com/2021/08/04/satellite-placing-a-3d-object-into-orbit-around-a-target/
        this.rotateObject('planet-earth', [.0005, .0004, 0])
        this.rotateObject('death-star', [-.0005, -.0004, 0])
        this.animateTorusGroup()
        this.updateMixers(clockDelta)
    }

    handleClick(name) {
        if(name === "test-sphere") {
            console.log("moving to explore view")
        } else if(name === "tierra_02_-_Default_0") {
			console.log("glow effect on object")
		} else if(name.slice(0,9) === "DeathStar") {
			console.log("move to death star")
		} else if(name.slice(0,6) === "sakura") {
			console.log("move to pink tree")
		}
    }
}