import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const starTexture = textureLoader.load('/textures/particles/2.png')

/**
 * Particles
 */
const particlesGeometry = new THREE.SphereGeometry(1, 32, 32)
const customGeometry = new THREE.BufferGeometry()
const count = 5000

const positions = new Float32Array(count * 3)
const color = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10
  color[i] = Math.random()
}

customGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3),
)

customGeometry.setAttribute(
  'color',
  new THREE.BufferAttribute(color, 3),
)

// Material
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.2,
  sizeAttenuation: true,
  transparent: true,
  alphaMap: starTexture,
  vertexColors: true,
})
// particlesMaterial.alphaText = 0.001
// particlesMaterial.depthTest = false
particlesMaterial.depthWrite = false
// particlesMaterial.blending = THREE.AdditiveBlending

// Points
const points = new THREE.Points(particlesGeometry, particlesMaterial)
const customPoints = new THREE.Points(customGeometry, particlesMaterial)
// scene.add(points)
scene.add(customPoints)

/**
 * Test cube
 */
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial()
)
// scene.add(cube)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update particles
  // customPoints.rotation.y = elapsedTime * 0.2

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const x = customGeometry.attributes.position.array[i3]
    customGeometry.attributes.position.array[i3 + 1] = Math.sin(
      elapsedTime + x,
    )
  }
  customGeometry.attributes.position.needsUpdate = true

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
