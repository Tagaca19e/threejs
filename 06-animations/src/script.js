import * as THREE from 'three'
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
mesh.rotateX(0.5)
scene.add(mesh)

// Sizes
const sizes = {
  width: 800,
  height: 600,
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.set(0, 0, 4)
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})

// Clock -- Alternative to Date.now()
const clock = new THREE.Clock()

// Using GSAP for animations
// gsap.to(mesh.position, { duration: 1, x: 2, delay: 1})
// gsap.to(mesh.position, { duration: 1, x: 0, delay: 2 });

// Using time to normalize animation.
// Animations
let time = Date.now()
const tick = () => {
  // Clock
  const elapsedTime = clock.getElapsedTime();

  // Time
  // const currentTime = Date.now()
  // const deltaTime = currentTime - time
  // time = currentTime
  // console.log(elapsedTime)
  mesh.rotation.y = elapsedTime
  // mesh.position.y = Math.sin(elapsedTime)
  // mesh.position.x = Math.cos(elapsedTime)

  // Camera is moving in a circle
  // camera.position.y = Math.sin(elapsedTime)
  // camera.position.x = Math.cos(elapsedTime)
  // camera.lookAt(mesh.position)

  // Update objects
  // mesh.rotation.y += 0.01
  // mesh.rotation.x += 0.01
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick()
