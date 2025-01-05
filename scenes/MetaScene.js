import * as THREE from 'three'
import ParentScene from './ParentScene'
import TWEEN from '@tweenjs/tween.js'

export default class MetaScene extends ParentScene {
    constructor(config) {
        super(config);
        console.log("MetaScene: constructor");
        this.initLoaded = false;
        this.vehiclesLoaded = false;
        this.initScene();
    }

    initScene() {
        console.log("MetaScene: initScene");
        this.setSceneStates();
        this.setSceneObjects();
    }

    setSceneObjects() {
        console.log("MetaScene: setSceneObjects");

        if (this.initLoaded === false) {

            // Create a group to hold all avatars
            this.avatarGroup = new THREE.Group();

            // Load "Jake" first
            this.loadGLTF(this.avatarGroup, '/ready-player-jake.glb', 'Jakonius', 1, { x: 0, y: 0, z: 0 }, false, 0, 0, 0)
                .then(() => {
                    // Load "Spidey" after "Jake"
                    return this.loadGLTF(this.avatarGroup, '/avatars/rigged_spider-man_3d_model/scene.gltf', 'Spidey', 1, { x: 1.4, y: 0, z: 0 }, false, 0, 0, 0);
                })
                .then(() => {
                    // keep it going
                    return this.loadGLTF(this.avatarGroup, '/avatars/shrek (1)/scene.gltf', 'Shrek', .9, { x: 2.8, y: 0, z: 0 }, false, 0, 0, 0);
                })
                .then(() => {
                    // Load em all, this isn't scalable lol
                    return this.loadGLTF(this.avatarGroup, '/avatars/cyberpunk/keanu_cyberpunk_2077_obj/scene.gltf', 'Keanu', .025, { x: 4.2, y: 0, z: 0 }, false, 0, 0, 0);
                })
                .then(() => {
                    // Load em all, this isn't scalable lol
                    return this.loadGLTF(this.avatarGroup, '/avatars/goku-rigged-animated/scene.gltf', 'Goku', .6, { x: 5.6, y: .05, z: 0 }, false, 0, 0, 0);
                })
                .then(() => {
                    // Load em all, this isn't scalable lol
                    return this.loadGLTF(this.avatarGroup, '/avatars/astronaut/scene.gltf', 'Astronaut', .5, { x: 7, y: .05, z: 0 }, false, 0, 0, 0)
                })
                .then(() => {
                    // Load em all, this isn't scalable lol
                    return this.loadGLTF(this.avatarGroup, '/vehicles/2022_porsche_911_gt3_992/scene.gltf', 'Porsche', 60, { x: 8.4, y: .2, z: 0 }, false, 0, 0, 0)
                })
                .then(() => {

                    // Add the group to the scene
                    this.scene.add(this.avatarGroup);

                    this.addSpaceTravel();
                    this.initializeProfileCard();
                    this.initLoaded = true;
                    this.onSceneLoaded();
                    this.initAvatarPicker(); // Set up the picker after everything is loaded
                })
                .catch((error) => {
                    console.error("Error loading GLTF models:", error);
                });
        }
    }

    loadVehicles() {
        // Create a group to hold all vehicles
        this.vehicleGroup = new THREE.Group();

        console.log("MetaScene: loadVehicles")

        // load vehicles
        this.loadGLTF(this.avatarGroup, '/vehicles/back_to_the_future_2_delorean_from_gta_5_mod/scene.gltf', 'Delorean', .5, { x: 8.4, y: .5, z: 0 }, false, 0, 0, 0)
            .then(() => {
                // Load em all, this isn't scalable lol
                return this.loadGLTF(this.avatarGroup, '/vehicles/Ferrari-1995-red/scene.gltf', 'Ferrari 1995', 50, { x: 9.8, y: .25, z: 0 }, false, 0, 0, 0)
            })
            .then(() => {
                // Load em all, this isn't scalable lol
                return this.loadGLTF(this.avatarGroup, '/vehicles/ford_mustang_1965/scene.gltf', 'Mustang 1965', 1.1, { x: 11.2, y: .25, z: 0 }, false, 0, 0, 0)
            })
            .then(() => {
                // Load em all, this isn't scalable lol
                return this.loadGLTF(this.avatarGroup, '/vehicles/1999_nissan_skyline_gtr_r34_c-west__2f2f (1)/scene.gltf', 'Skyline', 1, { x: 12.6, y: .25, z: 0 }, false, 0, 0, 0)
            })
            .then(() => {
                // Load em all, this isn't scalable lol
                return this.loadGLTF(this.avatarGroup, '/vehicles/ford_gt40_2005/scene.gltf', 'Ford GT', 0.05, { x: 14, y: .25, z: 0 }, false, 0, 0, 0)
            })
            .then(() => {
                // If you have more avatars, you can chain them similarly

                // Add the group to the scene
                this.scene.add(this.avatarGroup);

                this.vehiclesLoaded = true;
                // this.initVehiclePicker(); // Set up the picker after everything is loaded
            })
            .catch((error) => {
                console.error("Error loading GLTF models:", error);
            });
    }
     

    // TODO: Get this to work, add ability to switch between Avatars and Vehicles
    // Need button in menu to work first then call this function
    showVehicleGroup() {
        console.log("MetaScene: showVehicleGroup")
        // check if vehicle group exists
        if (!this.vehicleGroup) {
            console.error("Vehicle group not defined.")
            return
        }

        // decide how you will hide and show these elements
        // options:
        // 1. Vertical scroll
        // 2. Animate to new position in the Metaverse
        //    This is what I've already done with previous demos, need to know my 
        //    environment layout if I'm going to do this. I think it's the right choice though.
        // 3. Not sure
    }

    moveAvatarGroupX(targetX) {
        console.log("MetaScene: moveAvatarGroupX")
        // Ensure the avatar group exists
        if (!this.avatarGroup) {
            console.error("Avatar group is not initialized.");
            return;
        }

        // Get the current X position of the group
        const startPosition = { x: this.avatarGroup.position.x };

        // Set the target position
        const targetPosition = { x: targetX };

        // Create a tween for smooth animation
        const tween = new TWEEN.Tween(startPosition)
            .to(targetPosition, 800) // 1500ms duration
            .easing(TWEEN.Easing.Quadratic.InOut) // Apply easing for smoothing
            .onUpdate(() => {
                // Update the position of the avatar group
                this.avatarGroup.position.x = startPosition.x;
            })
            .onComplete(() => {
                console.log("Avatar group move complete.");

                // Here you can update other elements based on the centered avatar
                // For example, change text or graphics:
                const centeredAvatarIndex = this.getCenteredAvatarIndex();
                this.updateUIForAvatar(centeredAvatarIndex);
            });

        // Start the tween animation
        tween.start();
    }

    addArrowControls() {
        console.log("MetaScene: addArrowControls")
        const leftArrow = document.createElement('div');
        leftArrow.id = 'left-arrow';
        leftArrow.className = 'arrow';
        leftArrow.innerHTML = '&lt;';
        leftArrow.style.left = '38%';  // Position closer to the center horizontally
        leftArrow.style.color = 'white';
        leftArrow.style.cursor = 'pointer';
        leftArrow.style.zIndex = '1000'; // Ensure it's above other elements

        const rightArrow = document.createElement('div');
        rightArrow.id = 'right-arrow';
        rightArrow.className = 'arrow';
        rightArrow.innerHTML = '&gt;';
        rightArrow.style.color = 'white';
        rightArrow.style.cursor = 'pointer';
        rightArrow.style.zIndex = '1000'; // Ensure it's above other elements

        document.body.appendChild(leftArrow);
        document.body.appendChild(rightArrow);

        // Add event listeners to the arrows
        leftArrow.addEventListener('click', () => {
            console.log("left arrow click: " + this.currentIndex)
            if (this.currentIndex > 0) {
                this.currentIndex--;
                const targetX = -(this.currentIndex * 1.4); // Assuming each avatar is spaced by 2 units
                this.moveAvatarGroupX(targetX);
            }
        });

        rightArrow.addEventListener('click', () => {
            console.log("right arrow click")
            if (this.currentIndex < this.avatarGroup.children.length - 1) {
                this.currentIndex++;
                const targetX = -(this.currentIndex * 1.4); // Assuming each avatar is spaced by 2 units
                this.moveAvatarGroupX(targetX);
            }
        });
    }

    initAvatarPicker() {
        console.log("MetaScene: initAvatarPicker")
        // Create left and right arrows and add them to the screen
        this.currentIndex = 0
        this.avatarName = "Jakonius"

        this.addArrowControls()
    }

    // Utility function to determine which avatar is centered
    getCenteredAvatarIndex() {
        console.log("MetaScene: getCenteredAvatarIndex");
        return this.currentIndex;
    }

    // Update UI elements based on the centered avatar
    updateUIForAvatar(index) {
        console.log("MetaScene: updateUIForAvatar");
        // Example: Update a text element with the name of the centered avatar
        const avatarName = this.avatarGroup.children[index].name;
        const avatarNameElement = document.getElementById('username');
        if (avatarNameElement) {
            avatarNameElement.textContent = `${avatarName}`;
        }

        this.avatarName = avatarName
        // Additional graphics or UI updates can be done here based on the centered avatar
    }

    onSceneLoaded() {
        console.log("MetaScene: onSceneLoaded");
        if (this.onLoadedCallback) {
            this.onLoadedCallback(); // Notify the main.js or scene controller
        }
    }

    setOnLoadedCallback(callback) {
        console.log("MetaScene: setOnLoadedCallback");
        this.onLoadedCallback = callback;
    }

    initializeProfileCard() {
        console.log("MetaScene: initializeProfileCard");
        this.createProfileCardUI();
        this.addProfileCardListeners();
    }

    createProfileCardUI() {
        console.log("MetaScene: createProfileCardUI");
        const usernameDiv = document.createElement('div');
        usernameDiv.id = 'username';
        usernameDiv.className = 'z-top';
        usernameDiv.textContent = "Jakonius";

        const launchButtonGroup = document.createElement('div');
        launchButtonGroup.id = 'launch-button-group';

        const avatarButton = document.createElement('div');
        avatarButton.id = 'avatar-button';
        avatarButton.textContent = 'Avatars';

        const vehicleButton = document.createElement('div');
        vehicleButton.id = 'vehicle-button';
        vehicleButton.textContent = 'Vehicles';

        const profileCardDiv = document.createElement('div');
        profileCardDiv.id = 'profile-card';
        profileCardDiv.className = 'z-top hidden';
        profileCardDiv.innerHTML = `
            <h5>Metaverse ID</h5>
            <h6>
                <a target="_blank" href="https://www.linkedin.com/in/jake-posner">LinkedIn</a> 
                <a target="_blank" href="https://www.jakeposner.com">Portfolio</a> 
                <a target="_blank" href="https://www.x.com/jakeposner_">X - Twitter</a>  
            </h6>
            <h6><a target="_blank" href="https://visionquest.beehiiv.com/">Vision Quest Newsletter</a></h6>
        `;

        document.body.appendChild(usernameDiv);
        document.body.appendChild(profileCardDiv);
        launchButtonGroup.appendChild(avatarButton);
        launchButtonGroup.appendChild(vehicleButton);
        document.body.appendChild(launchButtonGroup);

        this.usernameElement = usernameDiv;
        this.profileCardElement = profileCardDiv;
        this.avatarButtonElement = avatarButton
        this.vehicleButtonElement = vehicleButton
    }

    // TODO: This should probably go to the ParentScene
    createDialog(text, id) {
        console.log("MetaScene: createDialog");
        const dialog = document.createElement('div')
        dialog.id = id
        dialog.className = 'z-top hidden'
        dialog.innerHTML = `
            <h5>${text}</h5>
            <h6>Active Construction Zone</h6>
        `

        dialog.addEventListener('click', () => {
            dialog.classList.toggle('hidden')
        });
        document.body.appendChild(dialog)
        this.dialogElement = dialog
    }

    addProfileCardListeners() {
        console.log("MetaScene: addProfileCardListeners");
        this.createDialog("Coming soon!", "coming-soon-dialog")
        this.usernameElement.addEventListener('click', () => {
            this.profileCardElement.classList.toggle('hidden');
        });


        this.profileCardElement.addEventListener('click', () => {
            this.profileCardElement.classList.toggle('hidden')
        })

        this.vehicleButtonElement.addEventListener('click', () => {
            this.dialogElement.classList.toggle('hidden')
        })

        document.addEventListener('click', (event) => {
            this.toggleHidden(this.profileCardElement, this.usernameElement, event);
        });

    }

    toggleHidden(element1, element2, event) {
        console.log("MetaScene: toggleHidden");
        if (!element1.classList.contains('hidden') &&
            !element1.contains(event.target) &&
            !element2.contains(event.target)) {
            element1.classList.add('hidden');
        }
    }

    setSceneStates() {
        console.log("MetaScene: setSceneStates");
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
        };
        this.sceneStates = sceneStates;
    }

    // pearl electron and metaverse header for now
    setMetaverseLogo() {
        console.log("MetaScene: setMetaverseLogo");
        let optimerBoldUrl = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json';
        let metaverseHeader = '';
        let headerScale = 1.5;
        let headerTranslation = [-5, 5, 60];
        if (window.innerWidth > 700) {
            metaverseHeader = 'Reality Labs';
        } else {
            metaverseHeader = "Mobile coming soon";
            headerScale = 1.2;
            headerTranslation = [-8, 0, 45];
        }

        this.loadText(optimerBoldUrl, 'metaverse-header', metaverseHeader, headerScale, .2, headerTranslation, true, 0, 0, 0);
    }

    // space
    addSpaceTravel() {
        console.log("MetaScene: addSpaceTravel");
        // star geometry and material
        const starCount = 10000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 1000; // Random position within a 1000x1000x1000 cube
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x00aaff,
            size: 0.5,
            transparent: true,
            alphaTest: 0.5, // This will discard fragments with alpha less than 0.5, making the points appear as circles
            depthWrite: false // This can help with transparency issues
        });

        const stars = new THREE.Points(geometry, material);
        this.starCount = starCount;
        this.stars = stars;
        this.scene.add(stars);
    }

    animateStars() {
        //console.log("animateStars: running");
        var stars = this.stars;
        var starCount = this.starCount;
        // Update star positions
        const positions = stars.geometry.attributes.position.array;
        // i = 0 = x axis, i = 1 = y axis, i = 2 = z axis
        for (let i = 2; i < starCount * 3; i += 3) {
            positions[i] += 1;
            if (positions[i] > 500) positions[i] = -500; // Reset position when it goes out of bounds
        }
        stars.geometry.attributes.position.needsUpdate = true;
    }

    animateScene(clockDelta) {
        this.rotateObject(this.avatarName, [0, .005, 0])
        this.animateStars()
    }
}
