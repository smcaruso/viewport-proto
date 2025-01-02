import './style.css'
import * as three from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const appContainer = document.querySelector('#app')

// Minimum three.js renderer, scene and camera setup
const scene = new three.Scene()
const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new three.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
appContainer.appendChild(renderer.domElement)

// make renderer and canvas clear color transparent
renderer.setClearColor(0x000000, 0)

// add fog to the scene
scene.fog = new three.Fog(0x242424, 20, 100)

// event listener to auto-resize the renderer when the window is resized
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
})

// add grid helper to scene
const gridHelper = new three.GridHelper(1000, 1000, 0x444444, 0x444444)
scene.add(gridHelper)

// set up orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.zoomToCursor = true
camera.position.set( 20, 20, 20 )
controls.target.set(0, 0, 0)
controls.update()

// render loop
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

animate()
