import * as THREE from 'three'
import ParentScene from './ParentScene'

export default class SandboxScene extends ParentScene {
    constructor(config) {
        super(config)
        this.isLoaded = false
        this.items = [
            // {
            //     name: 'jake',
            //     uri: '/ready-player-jake.glb',
            //     scale: 1,
            //     position: {x: -3.5, y: 11.5, z: 73},
            //     animate: false,
            //     xRotation: 0, 
            //     yRotation: 0,
            //     zRotation: 0
            // }
        ]
    }

    setSceneObjects() {
        // table surface
        // this.addCube("table", "concrete-table-texture.jpeg", 15, .4, 8, [0,11,70], [.75, 0, 0])

        this.loadItemMenu()
        this.setItemState()

        // directional light
        this.addLightToScene("directional", "display-light", 0xffffff, [0, 20, 80], 5)
        this.isLoaded = true
    }

    loadItemMenu() {
        // load vertically scrolling 3D model menu on lefthand side of screen

        // set this up to animate based on user input
        // for loop
        var items = this.items
        for(let i = 0; i < items.length; i++) {
            var item = items[i]
            this.loadGLTF(
                this.scene, 
                item.uri, 
                item.name, 
                item.scale, 
                {x: item.position.x, y: item.position.y, z: item.position.z}, 
                item.animate, 
                item.xRotation, 
                item.yRotation, 
                item.zRotation
            )
        }
    }

    setItemState() {
        if(!this.isLoaded) {
            this.loadGLTF(this.scene, '/ready-player-jake.glb', 'rp-jake', 2.25, {x: 0, y: 10, z: 72}, false, 0, 0, 0)
        }
    }

    // setLights() {
    //     this.lights = []
    //     this.addLightToScene("ambient", "ambient-light")
    //     this.addLightToScene("point", "point-light-1", 0xffffff, [0, 0, 0], 100, 10)
    // }

    animateScene() {
        this.rotateObject('rp-jake', [0, .01, 0])
    }
}