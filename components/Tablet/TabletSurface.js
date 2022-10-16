import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { AnimationObjectGroup, MeshPhongMaterial, Vector3 } from 'three'

export default class TabletSurface {
    constructor(config) {
        this.setTabletDefaults()
        this.buildSurfacePlane(config)
        this.initTabletSurfaceGroup()
        this.initTabletData(config)
    }

    setTabletDefaults() {
        this.textValues = {
            header: .55,
            subheader: .4,
            body: .33
        }
    }

    initTabletData(config) {
        this.setHeader(config.headerText)
        this.setDestinations(config.destinations)
        this.setDataView(config.dataSources)
    }

    initTabletSurfaceGroup() {
        this.tabletSurfaceGroup = new THREE.Group()
        this.tabletSurfaceGroup.add(this.tabletSurface)
    }

    getTabletSurface() {
        return this.tabletSurfaceGroup
    }

    buildSurfacePlane(config) {
        // Prototype of UI Tablet for Navigation
        const geometry = new THREE.PlaneGeometry(18,10)
        const material = new THREE.MeshBasicMaterial({color: 0x1c1c1c, side: THREE.DoubleSide})
        const tabletSurface = new THREE.Mesh(geometry, material)
        let translation = config.translation
        
        tabletSurface.position.set(translation[0], translation[1], translation[2])
        tabletSurface.rotation.set(-.1, -.1, 0)

        this.tabletSurface = tabletSurface   
    }

    setHeader() {
        let optimerBoldUrl = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json'
        let metaverseHeader = ''
        let headerScale = this.textValues.header
        let headerTranslation = [this.tabletSurface.position.x-8, this.tabletSurface.position.y+3.5, this.tabletSurface.position.z - 1.15]
        let headerRotation = [this.tabletSurface.rotation.x, this.tabletSurface.rotation.y, this.tabletSurface.rotation.z]
        if(window.innerWidth > 700) {
            metaverseHeader = 'Welcome to the Metaverse'
        } else {    
            metaverseHeader = "Mobile coming soon"
            headerScale = 1.2
            headerTranslation = [this.tabletSurface.position.x, this.tabletSurface.position.y, this.tabletSurface.position.z + .01]
        }
        
        var text = this.loadText(optimerBoldUrl, 'metaverse-header', metaverseHeader, headerScale,  .2, headerTranslation, true, headerRotation[0], headerRotation[1], headerRotation[2])
        console.log("this is running")
        console.log("---------")
        console.log("---------")
        console.log(text)
    }

    setDestinations(destinations) {
        let destinationGrid = new THREE.Group()
        let destinationMap = destinations
        
        let kaizenConfig = {
            position: [this.tabletSurface.position.x-5, this.tabletSurface.position.y+1, this.tabletSurface.position.z -.45],
            rotation: [this.tabletSurface.rotation.x, this.tabletSurface.rotation.y, this.tabletSurface.rotation.z]
        }

        let kaizen = this.buildRectangle(6, 3, 0xffffff, kaizenConfig.position, kaizenConfig.rotation)

        let metaConfig = {
            position: [this.tabletSurface.position.x-5, this.tabletSurface.position.y-2.25, this.tabletSurface.position.z-.15],
            rotation: [this.tabletSurface.rotation.x, this.tabletSurface.rotation.y, this.tabletSurface.rotation.z]
        }

        let meta = this.buildRectangle(6, 3, 0xffffff, metaConfig.position, metaConfig.rotation)

        let clubhouseConfig = {
            position: [this.tabletSurface.position.x+1.15, this.tabletSurface.position.y+1.06, this.tabletSurface.position.z +.2],
            rotation: [this.tabletSurface.rotation.x, this.tabletSurface.rotation.y, this.tabletSurface.rotation.z]
        }

        let clubhouse = this.buildRectangle(6, 3, 0xffffff, clubhouseConfig.position, clubhouseConfig.rotation)

        let sandboxConfig = {
            position: [this.tabletSurface.position.x+1.15, this.tabletSurface.position.y-2.19, this.tabletSurface.position.z+.4],
            rotation: [this.tabletSurface.rotation.x, this.tabletSurface.rotation.y, this.tabletSurface.rotation.z]
        }

        let sandbox = this.buildRectangle(6, 3, 0xffffff, sandboxConfig.position, sandboxConfig.rotation)

        destinationGrid.add(kaizen)
        destinationGrid.add(meta)
        destinationGrid.add(clubhouse)
        destinationGrid.add(sandbox)

        this.tabletSurfaceGroup.add(destinationGrid)
    }

    buildRectangle(width, height, color, position, rotation) {
        const geometry = new THREE.PlaneGeometry(width,height)
        const material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide})
        const rect = new THREE.Mesh(geometry, material)

        rect.position.set(position[0], position[1], position[2])
        rect.rotation.set(rotation[0], rotation[1], rotation[2])


        return rect
    }

    setDataView(){

    }

    loadText(fontUrl, name, text, size, height, position, shadow, xRotation = 0, yRotation = 0, zRotation = 0, visible = true) {
        let loader = new FontLoader()
        console.log(this.tabletSurfaceGroup)
        
        loader.load(fontUrl, (font) => {
            const geometry = new TextGeometry(text, {
                font: font,
                size: size,
                height: height,
            })
            const textMesh = new THREE.Mesh(geometry, [
                new MeshPhongMaterial({ color: 0xffffff}),
                new MeshPhongMaterial({ color: 0x000000}),
            ])
            textMesh.name = name
            textMesh.castShadow = shadow
            textMesh.position.set(position[0], position[1], position[2])
            textMesh.rotation.set(xRotation, yRotation, zRotation)
            textMesh.visible = visible
            this.tabletSurfaceGroup.add(textMesh)
        })

        // function addFontToScene(font) {
        //     const geometry = new TextGeometry(text, {
        //         font: font,
        //         size: size,
        //         height: height,
        //       })
        //       const textMesh = new THREE.Mesh(geometry, [
        //         new MeshPhongMaterial({ color: 0xffffff}),
        //         new MeshPhongMaterial({ color: 0x000000}),
        //       ])
        //       textMesh.name = name
        //       textMesh.castShadow = shadow
        //       textMesh.position.set(position[0], position[1], position[2])
        //       textMesh.rotation.set(xRotation, yRotation, zRotation)
        //       textMesh.visible = visible
        // }
        // this.tabletSurfaceGroup.add(textMesh)
    }
}