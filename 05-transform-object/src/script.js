import * as THREE from 'three'
import './style.css'

// Scene
const scene = new THREE.Scene()

// Cube
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// const mesh = new THREE.Mesh(geometry, material)
/**
 * Object3D
 */
const group = new THREE.Group()
scene.add(group)

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
group.add(cube1)

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
cube2.position.x = -2
group.add(cube2)

const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
cube3.position.x = 2;
group.add(cube3)

// == Position ==
group.position.y = 1

// == Scale ==
group.scale.y = 2

// == Rotation ==
group.rotation.y = 1

// == Position ==
// mesh.position.x = 0.6
// mesh.position.y = -0.6
// mesh.position.z = 1
// mesh.position.set(0.7, -0.6, 1)

// == Scale ==
// mesh.scale.x = 2
// mesh.scale.y = 0.5
// mesh.scale.z = 0.5
// mesh.scale.set(2, 0.5, 0.5)

// == Rotation ==
// mesh.rotation.reorder('YXZ')
// mesh.rotation.y = Math.PI * 0.25
// mesh.rotation.x = Math.PI * 0.25;
// mesh.rotation.x = 1

// Axes helper
/** @param len - len of the spokes.  */
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

// scene.add(mesh)

// Computes the euclidean length of the vector, which is considered as a point 
// in space
// console.log(mesh.position.length())

const sizes = {
  window: 800,
  height: 600,
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.window / sizes.height)
camera.position.z = 3
// camera.position.x = 1
// camera.position.y = 1

// camera.lookAt(mesh.position)
scene.add(camera)

// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.window, sizes.height)
renderer.render(scene, camera)
