// function moveCamera() {
    // logic that happens on user scrolling
//   }
  // use for scroll behaviors
  // document.body.onscroll = moveCamera;

  // load 3d text
function loadText(fontUrl, name, text, size, height, position, shadow, xRotation = 0, yRotation = 0, zRotation = 0, visible = true) {
  const loader = new FontLoader()

  loader.load(fontUrl, function (font) {
    const geometry = new TextGeometry(text, {
      font: font,
      size: size,
      height: height,
    })
    const textMesh = new THREE.Mesh(geometry, [
      new MeshPhongMaterial({ color: 0xffffff}),
      new MeshPhongMaterial({ color: 0x009390}),
    ])

    textMesh.name = name

    textMesh.castShadow = shadow
    textMesh.position.set(position[0], position[1], position[2])

    textMesh.rotation.x = xRotation
    textMesh.rotation.y = yRotation
    textMesh.rotation.z = zRotation

    textMesh.visible = visible
    scene.add(textMesh)
  })
}