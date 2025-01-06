import './style.css'
import * as three from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ViewportIcon from './viewportIcon'

const appContainer = document.querySelector('#app')
const viewportIcons = []

// Minimum three.js renderer, scene and camera setup
const scene = new three.Scene()
const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new three.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
appContainer.appendChild(renderer.domElement)

// renderer settings
renderer.setClearColor(0x242424, 0)
renderer.setPixelRatio(window.devicePixelRatio);
scene.fog = new three.Fog(0x242424, 5, 100)
renderer.antialias = true

// event listener to auto-resize the renderer when the window is resized
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
})

// add grid and axes helpers to scene
const gridHelper = new three.GridHelper(1000, 1000, 0x444444, 0x444444)
const axesHelper = new three.AxesHelper(1)
axesHelper.position.y = 0.01
scene.add(gridHelper, axesHelper)

// set up orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.zoomToCursor = true
camera.position.set( 5, 5, 5 )
controls.target.set(0, 0, 0)
controls.update()

// test object setup

const testPointLight = new three.Object3D()
const testSpotLight = new three.Object3D()
const testColliderBox = new three.Object3D()

// move test objects to random positions between -5 and 5 in the x and z azes and 0-2 in the y axis
testPointLight.position.set(Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5)
testSpotLight.position.set(Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5)
testColliderBox.position.set(Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5)

viewportIcons.push(
  new ViewportIcon("test point light", "point", testPointLight, camera),
  new ViewportIcon("test spot light", "spot", testSpotLight, camera, true),
  new ViewportIcon("test collider volume", "rigidbody", testColliderBox, camera)
)

scene.add(testPointLight, testSpotLight, testColliderBox)

// render loop
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)

    // testSpotLight.rotation.x += 0.01
    // testSpotLight.rotation.y += 0.01

    // get the positions of test objects in screen space and move the viewport icons to those positions
    viewportIcons.forEach(icon => {icon.updatePosition(camera)})
}

animate()
