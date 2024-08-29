import * as THREE from 'three'
import { DoubleSide } from 'three'
import ParentScene from './ParentScene'
import LoadingScene from './LoadingScene';
import SceneController from '../helpers/SceneController'

export default class MetaScene extends ParentScene {
    constructor(config) {
        super(config)
        this.isLoaded = false
        this.initScene()
    }

    initScene() {
        console.log("initScene running")
        this.setSceneStates()
        let sceneController = new SceneController()
        sceneController.testLogs()
        //sceneController.switchScene("test 1")
        //sceneController.loadScene("test 2")
        this.setSceneObjects()
    }

    setSceneObjects() {
        console.log("setSceneObjects: running 1");

        if (this.isLoaded === false) {
            console.log("setSceneObjects: running 2");

            // Load multiple GLTF models
            const promises = [];

            promises.push(this.loadGLTF(this.scene, '/ready-player-jake.glb', 'rp-jake', 1, { x: 0, y: 0, z: 0 }, false, 0, 0, 0));
            promises.push(this.loadGLTF(this.scene, '/avatars/halo-infinite-master-chief-rigged-walk./scene.gltf', 'master-chief', .5, { x: 1.4, y: 0, z: 0 }, false, 0, 0, 0));
            promises.push(this.loadGLTF(this.scene, '/avatars/goku-rigged-animated/scene.gltf', 'goku', .6, { x: -1.4, y: 0, z: 0 }, false, 0, 0, 0));

            // Wait for all models to load
            Promise.all(promises).then(() => {
                console.log("setSceneObjects: running 3")
                this.addSpaceTravel()
                this.initializeProfileCard()
                this.isLoaded = true
                this.onSceneLoaded()
            });
        }
    }

    onSceneLoaded() {
        if (this.onLoadedCallback) {
            this.onLoadedCallback(); // Notify the main.js or scene controller
        }
    }

    setOnLoadedCallback(callback) {
        this.onLoadedCallback = callback;
    }

    initializeProfileCard() {
        this.createProfileCardUI()
        this.addProfileCardListeners()
    }

    createProfileCardUI() {
        const usernameDiv = document.createElement('div')
        usernameDiv.id = 'username'
        usernameDiv.className = 'z-top'
        usernameDiv.textContent = 'Jakonius'

        const yearDiv = document.createElement('div')
        yearDiv.id = 'established'
        yearDiv.className = 'z-top'
        yearDiv.textContent = 'Est. 1991'

        const profileCardDiv = document.createElement('div')
        profileCardDiv.id = 'profile-card'
        profileCardDiv.className = 'z-top hidden'
        profileCardDiv.innerHTML = `
            <h5>Metaverse ID</h5>
            <h6>
                <a target="_blank" href="https://www.linkedin.com/in/jake-posner">LinkedIn</a> 
                <a target="_blank" href="https://www.jakeposner.com">Portfolio</a> 
                <a target="_blank" href="https://www.x.com/jakeposner_">X - Twitter</a>  
            </h6>
            <h6><a target="_blank" href="https://visionquest.beehiiv.com/">Vision Quest Newsletter</a></h6>
        `

        document.body.appendChild(usernameDiv)
        document.body.appendChild(profileCardDiv)
        document.body.appendChild(yearDiv)

        this.usernameElement = usernameDiv
        this.profileCardElement = profileCardDiv
    }

    addProfileCardListeners() {
        this.usernameElement.addEventListener('click', () => {
            this.profileCardElement.classList.toggle('hidden')
        })

        document.addEventListener('click', (event) => {
            this.toggleHidden(this.profileCardElement, this.usernameElement, event)
        })
    }

    toggleHidden(element1, element2, event) {
        if (!element1.classList.contains('hidden') &&
            !element1.contains(event.target) &&
            !element2.contains(event.target)) {
            element1.classList.add('hidden')
        }
    }
 
    // comment here
    setSceneStates() {
        let sceneStates = {
            landing: {
              name: "reality-labs",
              cameraPosition: [0, 12, 80],
              controlsTargetVector: [0, 0, -20]
            },
            inventory: {
              name: "portal",
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
        let headerScale = 1.5
        let headerTranslation = [-5, 5, 60]
        if(window.innerWidth > 700) {
            metaverseHeader = 'Reality Labs'
        } else {    
            metaverseHeader = "Mobile coming soon"
            headerScale = 1.2
            headerTranslation = [-8, 0, 45]
        }
        
        this.loadText(optimerBoldUrl, 'metaverse-header', metaverseHeader, headerScale,  .2, headerTranslation, true, 0, 0, 0)
    }

    // space
    addSpaceTravel() {
        // star geometry and material
        const starCount = 10000
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(starCount * 3)
        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 1000; // Random position within a 1000x1000x1000 cube
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const material = new THREE.PointsMaterial({
            color: 0x00aaff,
            size: 0.5,
            transparent: true,
            alphaTest: 0.5, // This will discard fragments with alpha less than 0.5, making the points appear as circles
            depthWrite: false // This can help with transparency issues
        })


        const stars = new THREE.Points(geometry, material)
        this.starCount = starCount
        this.stars = stars
        this.scene.add(stars)
    }

    animateStars() {
        var stars = this.stars
        var starCount = this.starCount
        // Update star positions
        const positions = stars.geometry.attributes.position.array
         // i = 0 = x axis, i = 1 = y axis, i = 2 = z axis
        for (let i = 2; i < starCount * 3; i += 3) {
            positions[i] += 1; // Move raindrops down
            if (positions[i] > 500) positions[i] = -500; // Reset position when it goes out of bounds
        }
        stars.geometry.attributes.position.needsUpdate = true
    }

    // comment here
    animateScene(clockDelta) {
        this.rotateObject('rp-jake', [0, .0025, 0])
        this.animateStars()
    }
}