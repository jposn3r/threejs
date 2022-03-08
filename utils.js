export default function openWebsite(url = "", newTab = true) {
	console.log("url: " + url)
    // if(newTab) {
	// 	window.open(url, '_blank')
	// } else {
	// 	window.open(url)
	// }
}

export function animateObjectToPosition(object, target, time) {
	console.log(object)
	var position = { x : object.position.x, y: object.position.y}
	var target = { x : target[0], y: target[1], z: target[2]}
	var tween = new TWEEN.Tween(position).to(target, time)

	tween.onUpdate(function() {
		object.position.x = position.x
		object.position.y = position.y
		object.position.z = position.z
	})

	tween.start()
}