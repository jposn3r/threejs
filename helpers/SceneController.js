class SceneController {
    constructor() {
        this.currentScene = null;
    }

    loadScene(scene) {
        // Load the specified scene
        console.log("load scene " + scene)
    }

    switchScene(scene) {
        // Perform a transition between the current scene and the specified scene
        // ...
        //   this.currentScene = scene
        console.log("switch scene to " + scene)
    }

    testLogs() {
        console.log("testing connection is live")
    }
}
  
export default SceneController