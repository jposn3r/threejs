import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import MainScene from '../scenes/MainScene';

class SceneController {
    constructor() {
        this.currentScene = null;
        this.sceneConfigs = this.getSceneConfigs()
        this.currentScene = this.getSceneConfigs().metaSceneConfig
    }

    getSceneConfigs() {
        let sceneConfigs = {
            metaSceneConfig: {
                name: "meta-scene",
                gui: false,
                background: '',
                gridFloor: true
            },
            mainSceneConfig: {
                name: "main-scene",
                gui: false,
                background: '',
                gridFloor: true,
                // background: './assets/wiami-bg.jpeg'
            },
            loadingSceneConfig: {
                name: "loading-scene",
                gui: false,
                background: '',
                gridFloor: true
            }
        }
        return sceneConfigs 
    }

    loadScene(scene) {
        // Load the specified scene
        console.log("load scene " + scene)
    }

    getCurrentScene() {
        console.log("\ncurrent scene: ")
        console.log(this.currentScene)
        return this.currentScene
    }

    switchScene(scene, data) {
        // Perform a transition between the current scene and the specified scene
        // ...
        //   this.currentScene = scene
        console.log("switch scene to " + scene + " with " + data)
        console.log("current scene to leave: " + this.currentScene.name)
        let currentScene = this.currentScene
        let nextScene = new MainScene({
            name: "main-scene",
            gui: false,
            background: '',
            gridFloor: true,
            sceneController: currentScene.sceneController
        })

        this.previousScene = currentScene
        this.currentScene = nextScene

    }
    
    testLogs() {
        console.log("testing scene controller is live")
    }

    // move camera and controls to new scene location
    animateToScene(sceneName) {
        console.log("\nanimateToScene: " + sceneName)
        console.log(sceneStates[sceneName])
        let scenePosition = sceneStates[sceneName].cameraPosition
        let controlsTargetVector = sceneStates[sceneName].controlsTargetVector

        // tween test area
        var controlsPosition = { x : controls.target.x, y: controls.target.y, z: controls.target.z}
        var controlsTarget = { x : controlsTargetVector[0], y: controlsTargetVector[1], z: controlsTargetVector[2]}
        var controlsTween = new TWEEN.Tween(controlsPosition).to(controlsTarget, 1500)

        controlsTween.onUpdate(function() {
            controls.target.x = controlsPosition.x
            controls.target.y = controlsPosition.y
            controls.target.z = controlsPosition.z
        })

        controlsTween.start()
        console.log("\n controls.target")
        console.log(controls.target)
        // controls.target = new THREE.Vector3(controlsTargetVector[0], controlsTargetVector[1], controlsTargetVector[2])

        // tween test area
        var position = { x : camera.position.x, y: camera.position.y, z: camera.position.z}
        var target = { x : scenePosition[0], y: scenePosition[1], z: scenePosition[2]}
        var tween3 = new TWEEN.Tween(position).to(target, 1500)

        tween3.onUpdate(function() {
            camera.position.x = position.x
            camera.position.y = position.y
            camera.position.z = position.z
        })

        tween3.start()
        tween3.onComplete(sceneStates[sceneName].callback)

        sceneState = sceneStates[sceneName]
    }

}
  
export default SceneController