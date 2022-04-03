import MainScene from "./MainScene"

export default class WilderWorldScene extends MainScene {
    constructor(config) {
        // coming soon!
        super(config)
    }
}

// let s3ModelsUrl = "https://jakonius-assets.s3.us-east-2.amazonaws.com/models/"

// let alfaRomeoCarResourceUrl = s3ModelsUrl + "alfa-romeo-stradale-1967/scene.gltf"
// let cribsResourceUrl = s3ModelsUrl + "buildings/scene.gltf"
// let airJordanResourceUrl = s3ModelsUrl + "air-jordan-1/scene.gltf"

// light
// const wilderPointLightBlue = new THREE.PointLight(0x00beee, 3, 100)
// const wilderPointLightYellow = new THREE.PointLight(0xffff00, 3, 100)
// const wilderPointLightPurple = new THREE.PointLight(0x6a0dad, 3, 100)

// // OnWilderWorldLoaded - called when we have finished animating the camera and controls to the wilder world area

// let wilderWorldLoaded = false

// function onWilderWorldLoaded() {
// 	console.log("\nwilder world loading complete\n")
// 	if(!wilderWorldLoaded) {
// 		wilderWorldLoaded = true
// 		wilderPointLightYellow.position.set(-10, 8, -245)
// 		scene.add(wilderPointLightYellow)
// 		wilderPointLightBlue.position.set(0, 12, -205)
// 		scene.add(wilderPointLightBlue)
// 		wilderPointLightPurple.position.set(10, 8, -225)
// 		scene.add(wilderPointLightPurple)

// 		// load new models for scene

// 		let wilderWorldHeader = 'Wilder World'
// 		loadText(optimerBoldUrl, 'wilder-world-header', wilderWorldHeader, 4, .08, [9, 25, -230], true, 0)

// 		// planet
// 		moon.position.set(32, 22, -250)

// 		// sphere
// 		scene.add(moon)

// 		// wilder logo

// 		// wheels
// 		loadGLTF(alfaRomeoCarResourceUrl, 'alfa-romeo-1967', 15, {x: -14, y: 8.5, z: -200}, false, 0.2, 0, 0)

// 		let wheelsHeader = 'Wheels'
// 		loadText(optimerBoldUrl, 'wheels-header', wheelsHeader, .5, .01, [-18, 12, -200], true, 0)

// 		// kicks
// 		loadGLTF(airJordanResourceUrl, 'air-jordan', 0.10, {x: -14, y: 15, z: -200}, false, .3, 1.5, 0.3)
// 		loadGLTF(airJordanResourceUrl, 'air-jordan-large', .5, {x: 0, y: 6, z: -200}, false, 0, 1.25, 0.1)
// 		airJordanResourceUrl = getObjectByName('air-jordan-large')

// 		let kicksHeader = 'Kicks'
// 		loadText(optimerBoldUrl, 'kicks-header', kicksHeader, .5, .01, [-18, 18, -200], true, 0)

// 		// cribs
// 		loadGLTF(cribsResourceUrl, 'cribs', .18, {x: -14, y: 1, z: -200}, false, 0.1, 0.1, 0)

// 		let cribsHeader = 'Cribs'
// 		loadText(optimerBoldUrl, 'cribs-header', cribsHeader, .5, .01, [-18, 6, -200], true, 0)

// 		// land - coming soon

// 		// new menu to navigate and go back to main menu - coming soon
// 	} else {
// 		getObjectByName("wilder-planet").visible = true
// 		getObjectByName("wilder-world-header").visible = true
// 		getObjectByName("alfa-romeo-1967").visible = true
// 		getObjectByName("wheels-header").visible = true
// 		getObjectByName("air-jordan").visible = true
// 		getObjectByName("kicks-header").visible = true
// 		getObjectByName("cribs").visible = true
// 		getObjectByName("cribs-header").visible = true
// 		getObjectByName('air-jordan-large').visible = true
// 	}
// }

// let hoverCarLoaded = false
// let astronautLoaded = false

// moon

// const moonTexture = new THREE.TextureLoader().load('/assets/moon.jpeg')
// const earthTexture = new THREE.TextureLoader().load('/assets/planet-earth.jpeg')
// const normalTexture = new THREE.TextureLoader().load('/assets/moon-normal-map.jpg')
// const earthNormalMap = new THREE.TextureLoader().load('/assets/earth-normal-map.jpeg')
// const sphereMaterial = new THREE.MeshStandardMaterial({
// 	map: earthTexture,
// 	normalMap: earthNormalMap
// })

// sphereMaterial.color = new THREE.Color(0x292929)
// const sphereGeometry = new THREE.SphereGeometry(20, 30, 30)

// const moon = new THREE.Mesh(
// 	sphereGeometry,
// 	sphereMaterial
// )

// // moon.callback = () => {openWebsite('https://www.wilderworld.com/')}

// moon.name = "wilder-planet"