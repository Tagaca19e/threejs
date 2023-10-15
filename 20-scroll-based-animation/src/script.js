import * as THREE from 'three'
import * as dat from 'lil-gui'
import { NearestFilter } from 'three'
import gsap from 'gsap'

THREE.ColorManagement.enabled = false

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()


/**
 * ============================================================================
 * Controllables
 * ============================================================================
 */
const parameters = {
  materialColor: '#ffffff',
  count: 1000,
  size: 0.02,
}


/**
 * ============================================================================
 * Primitives
 * ============================================================================
 */
const distance = 3
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = NearestFilter
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
})

// Create mesh primitives
const mesh = {
  one: new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
  ),
  two: new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
  ),
  three: new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  ),
}

// Reposition primitives
mesh.one.position.y = -distance * 0
mesh.two.position.y = -distance * 1
mesh.three.position.y = -distance * 2

mesh.one.position.x = 2
mesh.two.position.x = -2
mesh.three.position.x = 2

// Add and customize primitive meshes
for (let meshVal in mesh) {
  mesh[meshVal].material = material
  scene.add(mesh[meshVal])
}

const geometry = new THREE.BufferGeometry()
const positions = new Float32Array(parameters.count * 3)

for (let i = 0; i < parameters.count; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10
  positions[i * 3 + 1] = distance * 0.4 - Math.random() * distance * 3
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const pointsMaterial = new THREE.PointsMaterial({
  size: parameters.size,
  sizeAttenuation: true,
})

const points = new THREE.Points(geometry, pointsMaterial)
scene.add(points)

/**
 * ============================================================================
 * GUIs
 * ============================================================================
 */
const gui = new dat.GUI()

gui.addColor(parameters, 'materialColor').onChange(
  () => {
    material.color.set(parameters.materialColor)
    pointsMaterial.color.set(parameters.materialColor)
  }
)

/**
 * ============================================================================
 * Lights
 * ============================================================================
 */
const directionalLight = new THREE.DirectionalLight('white', 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)


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

const cameraGroup = new THREE.Group()
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 6
cameraGroup.add(camera)
scene.add(cameraGroup)

// Render
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * ============================================================================
 * Scrolling
 * ============================================================================
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
  scrollY = window.scrollY
  const newSection = Math.round(scrollY / sizes.height)

  const numberMappings = {
    0: 'one',
    1: 'two',
    2: 'three',
  }

  // Check if section was changed and animate when
  // object is in viewport
  if (newSection != currentSection) {
    currentSection = newSection
    const currentSectionNumber = numberMappings[currentSection]

    gsap.to(
      mesh[currentSectionNumber].rotation,
      {
        duration: 1.5,
        ease: 'power2.inOut',
        x: '+=6',
        y: '+=3',
        z: '+=1.5',
      }
    )
  }

})

/**
 * ============================================================================
 * Cursor
 * ============================================================================
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) => {
  cursor.x = (event.clientX / sizes.width) - 0.5
  cursor.y = (event.clientY / sizes.height) - 0.5
})

/**
 * ============================================================================
 * Animation
 * ============================================================================
 */
const clock = new THREE.Clock()
let previousTime = 0

function animate() {
  // Making sure delta time and animation looks good for every monitor
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  camera.position.y = - scrollY / sizes.height * distance

  const parallaxX = cursor.x
  const parallaxY = -cursor.y

  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 2 * deltaTime
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 2 * deltaTime

  for (let val in mesh) {
    mesh[val].rotation.x += deltaTime * 0.1
    mesh[val].rotation.z += deltaTime * 0.12
  }

  renderer.render(scene, camera)
  window.requestAnimationFrame(animate)
}
animate()
