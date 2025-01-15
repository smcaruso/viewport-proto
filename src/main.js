import './style.css'
import * as three from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import ViewportIcon from './viewportIcon'
import { viewport } from 'three/tsl'

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

// set up transform controls
const gizmoControls = new TransformControls( camera, renderer.domElement )
const gizmoToggles = document.querySelectorAll('#gizmo-controls input[type="radio"]')
gizmoControls.size = 0.5
gizmoControls.setMode("none")

gizmoControls.addEventListener( 'dragging-changed', function ( event ) {
  controls.enabled = ! event.value;
} )

gizmoToggles.forEach((toggle) => {
    toggle.addEventListener('change', (event) => {
      const gizmo = gizmoControls.getHelper()
      gizmoControls.setMode(event.target.value)
      if (event.target.value === "none") {
        gizmo.removeFromParent()
        viewportIcons.forEach(icon => {
          icon.element.classList.remove("gizmo-on")
          icon.element.style.background = icon.iconColor
        })
        return
      }
      for (const icon of viewportIcons) {
        if (icon.selected === true) {
          gizmoControls.attach(icon.object)
          icon.element.style.background = null
          icon.element.classList.add("gizmo-on")
			    scene.add( gizmo )
          break
        }
      }
    })
})

// test object setup

const testPointLight = new three.Object3D()
const testSpotLight = new three.Object3D()
const testColliderBox = new three.Object3D()

// move test objects to random positions between -5 and 5 in the x and z azes and 0-2 in the y axis
testPointLight.position.set(Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5)
testSpotLight.position.set(Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5)
testColliderBox.position.set(Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5)

scene.add(testPointLight, testSpotLight, testColliderBox)

viewportIcons.push(
  new ViewportIcon("test point light", "point", testPointLight, camera),
  new ViewportIcon("test spot light", "spot", testSpotLight, camera, true),
  new ViewportIcon("test collider volume", "rigidbody", testColliderBox, camera)
)

const cursorStart = {x: 0, y: 0}

viewportIcons.forEach(icon => {

  icon.element.addEventListener("pointerdown", (event) => {

    cursorStart.x = event.clientX
    cursorStart.y = event.clientY
  
    icon.cursorStart.x = event.clientX
    icon.cursorStart.y = event.clientY
    icon.cursorStartObjectY = icon.object.position.y
  
    document.body.style.cursor = "grabbing"
    icon.grabbing = true
    icon.helperLines.start(icon.object.position)
  })

})

window.addEventListener("pointerup", (event) => {

  let icon = null

  viewportIcons.forEach( each => {
    each.dragOperationStarted = false
    each.grabbing = false
    each.helperLines.stop()
  })

  if (event.target.classList.contains("viewport-icon")) {
    document.body.style.cursor = "grab"
    for (const index in viewportIcons) {
      if (viewportIcons[index].element === event.target) {
        icon = viewportIcons[index]
        const label = icon.element.querySelector(".label")
        label.innerText = icon.iconName
        break
      } else {
        viewportIcons[index].element.classList.remove("gizmo-on")
        viewportIcons[index].element.background = viewportIcons[index].iconColor
      }
    }
  }
  const delta = Math.abs(event.clientX - cursorStart.x) + Math.abs(event.clientY - cursorStart.y)
  if (delta < 15) {
    viewportIcons.forEach( each => {
      each.element.style.background = each.iconColor
      each.element.classList.remove("gizmo-on")
    })
  }
  if (delta < 15 && icon && (event.ctrlKey || event.metaKey)) { icon.toggleSelection() }
  else if (delta < 15 && icon && !event.shiftKey) {
    viewportIcons.forEach( each => {
      if (each === icon || each.selected) {
        each.toggleSelection()
        if ((event.target !== each.element) && (event.target !== each.hierarchyItem)) { each.unhover() }
      }
    })
  }
  else if (delta > 15 && !event.target.classList.contains("viewport-icon")) { viewportIcons.forEach(each => each.unhover())}

  const gizmo = gizmoControls.getHelper()

  if (gizmoControls.mode !== "none" && icon) {
    gizmoControls.attach(icon.object)
    icon.element.style.background = null
    icon.element.classList.add("gizmo-on")
    scene.add( gizmo )
  }

})

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
