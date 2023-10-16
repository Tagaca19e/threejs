import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'

THREE.ColorManagement.enabled = false

/**
 * Debug
 */
const gui = new dat.GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3')

function playHitSound(collision) {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal()

  if (impactStrength > 1) {
    // Sounds too the same, make sure to randomize time to make it realistic.
    // hitSound.volume = Math.random()

    // Reset sound to 0, guard when sound is already playing.
    hitSound.currentTime = 0
    hitSound.play()
  }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.png',
  '/textures/environmentMaps/0/nx.png',
  '/textures/environmentMaps/0/py.png',
  '/textures/environmentMaps/0/ny.png',
  '/textures/environmentMaps/0/pz.png',
  '/textures/environmentMaps/0/nz.png',
])

/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true   // If object is not moving make it sleep for perf.
world.gravity.set(0, -9.82, 0)

// Materials
const defaultMaterial = new CANNON.Material('default')

// Add friction and bounciness for plastic and concrete but simplified
// to just one default material
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.9,
  }
)

world.defaultContactMaterial = defaultContactMaterial

// const sphereShape = new CANNON.Sphere(0.5)

// const sphereBody = new CANNON.Body({
//   mass: 1,
//   position: new CANNON.Vec3(0, 3, 0),
//   shape: sphereShape,
//   material: defaultMaterial,
// })

// // TODO(etagaca): This is where you left of discussing about forces and materials
// // friction and gravity.
// sphereBody.applyForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
// world.addBody(sphereBody)

const randomPoints = Math.random() - 0.5
const parameters = {
  floorRotation: 0.5,
  createSphere: () => {
    createSphere(
      Math.random() * 0.5,
      new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 5,
        (Math.random() - 0.5) * 3
      )
    )
  },
  createBox: () => {
    createBox(
      Math.random(),
      Math.random(),
      Math.random(),
      new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 5,
        (Math.random() - 0.5) * 3
      )
    )
  },
  reset: () => {
    for (let object of objectsToUpdate) {
      // Remove event listener.
      object.body.removeEventListener('collide', playHitSound)
      
      // Remove body from world.
      world.removeBody(object.body)

      // Remove mesh from the scene.
      scene.remove(object.mesh)
    }
    objectsToUpdate.splice(0, objectsToUpdate.length)
  }
}

// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.material = defaultMaterial
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(-1, 0, 0), // Rotate on the x axis negative side
  Math.PI * parameters.floorRotation
)
world.addBody(floorBody)

gui.add(parameters, 'floorRotation').min(0).max(2).step(0.5).setValue(0.5)
gui.add(parameters, 'createSphere')
gui.add(parameters, 'createBox')
gui.add(parameters, 'reset')

/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(0.5, 32, 32),
//   new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMap: environmentMapTexture,
//     envMapIntensity: 0.5,
//   })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#777777',
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(-3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils
 */
const objectsToUpdate = []

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
})

function createSphere(radius, position) {
  // Create mesh and provide geometry and material for creating primitives.
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
  mesh.scale.set(radius, radius, radius) // Scale using the radius
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  const shape = new CANNON.Sphere(radius)
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: defaultMaterial,
  })
  body.position.copy(position)

  // Listen to events, this automatically sends an event to playHitSound.
  body.addEventListener('collide', playHitSound)

  world.addBody(body)

  // Save in objects to update
  objectsToUpdate.push({
    mesh: mesh, // Actual sphere
    body: body, // Gravity sphere
  })
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.5,
  envMap: environmentMapTexture,
})

function createBox(width, height, depth, position) {
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
  mesh.scale.set(width, height, depth)
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2))
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: defaultMaterial,
  })
  body.position.copy(position)

  // Listen to events, this automatically sends an event to playHitSound.
  body.addEventListener('collide', playHitSound)

  // world.add(body)
  world.addBody(body)

  objectsToUpdate.push({
    mesh: mesh,
    body: body,
  })
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  // Update physics world
  // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)

  // Update physics
  world.step(1 / 60, deltaTime, 3)

  // Copy the position of the physics body to the sphere
  // sphere.position.copy(sphereBody.position)

  for (const object of objectsToUpdate) {
    object.mesh.position.copy(object.body.position)
    object.mesh.quaternion.copy(object.body.quaternion)
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
