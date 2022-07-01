import * as THREE from 'three'
import ParentScene from './ParentScene'

export default class SandboxScene extends ParentScene {
    constructor(config) {
        super(config)
        this.isLoaded = false
        this.weapons = [
            {
                name: 'sc35_andvari',
                uri: '/sc35_andvari/scene.gltf',
                scale: 3,
                position: {x: -3.5, y: 11.5, z: 73},
                animate: false,
                xRotation: 0, 
                yRotation: 1.5,
                zRotation: 0
            },
            {
                name: 'desert-eagle',
                uri: '/desert_eagle_gun/scene.gltf',
                scale: .005,
                position: {x: -4, y: 13.5, z: 72},
                animate: false,
                xRotation: 0, 
                yRotation: -1.5,
                zRotation: 0
            },
            {
                name: 'sniper',
                uri: '/sci_fi_weapon._gameready_gun__rifle./scene.gltf',
                scale: .25,
                position: {x: -4.25, y: 9.5, z: 73},
                animate: false,
                xRotation: 0, 
                yRotation: -1.5,
                zRotation: 0
            }
        ]

        // Let's make the COD gun inspection screen

        // Focus on the 3D implications first

        // Requirements
        // 1. Table
        // this.loadGLTF(this.scene, "uri", "", 10, {x: 0, y: 0, z: -5}, false, 0, 1.5, 0)

        // 2. Camera view above the table
        // Override setCamera
        
        // 3. Camera movement to allow shift in focus and inspection of objects

        // 4. Render Main Gun

        // 5. Render Secondary Gun

        // 6. Render surrounding elements for decoration

    }

    setSceneObjects() {
        // table surface
        this.addCube("table", "concrete-table-texture.jpeg", 15, .4, 8, [0,11,70], [.75, 0, 0])

        this.loadWeaponMenu()
        this.setWeaponState()

        // directional light
        this.addLightToScene("directional", "display-light", 0xffffff, [0, 20, 80], 5)
        this.isLoaded = true
    }

    loadWeaponMenu() {
        // load vertically scrolling 3D model menu on lefthand side of screen

        // set this up to animate based on user input
        // for loop
        var weapons = this.weapons
        for(let i = 0; i < weapons.length; i++) {
            var weapon = weapons[i]
            this.loadGLTF(
                this.scene, 
                weapon.uri, 
                weapon.name, 
                weapon.scale, 
                {x: weapon.position.x, y: weapon.position.y, z: weapon.position.z}, 
                weapon.animate, 
                weapon.xRotation, 
                weapon.yRotation, 
                weapon.zRotation
            )
        }
    }

    setWeaponState() {
        if(!this.isLoaded) {
            this.loadGLTF(this.scene, '/desert_eagle_gun/scene.gltf', 'desert-eagle', .0125, {x: 1, y: 11.5, z: 72}, false, 0, -1.5, 0)
        }
    }

    // setLights() {
    //     this.lights = []
    //     this.addLightToScene("ambient", "ambient-light")
    //     this.addLightToScene("point", "point-light-1", 0xffffff, [0, 0, 0], 100, 10)
    // }
}