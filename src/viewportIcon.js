import audio from "/audio.svg"
import box from "/box.svg"
import camera from "/camera.svg"
import cylinder from "/cylinder.svg"
import directional from "/directional.svg"
import envmap from "/envmap.svg"
import hemisphere from "/hemisphere.svg"
import mountpoint from "/mountpoint.svg"
import point from "/point.svg"
import portal from "/portal.svg"
import rigidbody from "/rigidbody.svg"
import spawnpoint from "/spawnpoint.svg"
import sphere from "/sphere.svg"
import spot from "/spot.svg"
import trigger from "/trigger.svg"
import video from "/video.svg"

import * as three from "three"
import gsap from "gsap"

import { Line2 } from "three/examples/jsm/lines/Line2.js"
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js"
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js"

import BoundingBox from "./boundingBox.js"
import ColorPicker from "./colorPicker.js"
import HelperLines from "./helperLines.js"
import Comment from "./comment.js"

export default class ViewportIcon {

  constructor(name, type, object, camera, directional = false) {

    this.iconName = name
    this.iconType = type
    this.object = object // is Object3D
    this.directional = directional
    this.arrowElement = null

    this.forward = new three.Object3D()
    this.forward.translateZ(1.5)
    this.object.add(this.forward)

    let worldPosition = new three.Vector3()
    this.object.getWorldPosition(worldPosition)

    this.groundProjection = new three.Object3D()
    this.groundProjection.position.set(0, worldPosition.y * -1, 0)
    this.object.add(this.groundProjection)
    
    this.camera = camera

    this.iconColor = "#797979"

    this.lineMaterial = new LineMaterial({
      color: 0xffffff,
      dashed: true,
      linewidth: 2,
      dashSize: 0.1,
      gapSize: 0.075,
      transparent: true,
      opacity: 0
    })

    this.element = this.drawElement()
    this.hierarchyItem = this.setupHierarchy()
    this.yLine = this.drawLine()
    
    this.selected = false
    this.grabbing = false
    this.drag = this.drag.bind(this) // reference allows the removal of the event listener
    this.raycaster = new three.Raycaster()
    this.intersectPlane = new three.Plane(new three.Vector3(0, 1, 0))
    this.helperLines = new HelperLines(this.object)
    this.cursorStart = {x: null, y: null}
    this.dragOperationStarted = false
    this.cursorStartObjectY = null

    this.boundingBox = null

    if (type === "rigidbody") {
      this.boundingBox = new BoundingBox(2, 2, 1)
      this.object.add(this.boundingBox)
    }

    if (this.directional) {
      this.cone = this.drawCone()
      this.object.add(this.cone)
    }

    document.querySelector("#app").appendChild(this.element)

    this.element.addEventListener("pointerenter", this.hover.bind(this))
    this.element.addEventListener("pointerleave", this.unhover.bind(this))
    this.element.addEventListener("contextmenu", this.rightClick.bind(this))
    window.addEventListener("pointermove", this.drag)

  }

  drawElement() {

    const element = document.createElement("div")
    element.classList.add("viewport-icon")
    element.style.background = this.iconColor

    const svgElement = document.createElement("img")

    const iconMap = new Map([
      ["audio", audio],
      ["box", box],
      ["camera", camera],
      ["cylinder", cylinder],
      ["directional", directional],
      ["envmap", envmap],
      ["hemisphere", hemisphere],
      ["mountpoint", mountpoint],
      ["point", point],
      ["portal", portal],
      ["rigidbody", rigidbody],
      ["spawnpoint", spawnpoint],
      ["sphere", sphere],
      ["spot", spot],
      ["trigger", trigger],
      ["video", video]
    ])

    if (iconMap.has(this.iconType)) { svgElement.src = iconMap.get(this.iconType) }
    else { console.warn(`Unknown icon type: ${this.iconType}`) }

    if (this.directional) {

      const arrow = document.createElement("div")
      arrow.classList.add("viewport-arrow")
      arrow.style.background = this.iconColor

      const arrowHead = document.createElement("div")
      arrowHead.classList.add("viewport-arrowhead")
      arrowHead.style.borderLeft = `16px solid ${this.iconColor}`

      arrow.appendChild(arrowHead)
      element.appendChild(arrow)

      this.arrowElement = arrow // Store reference for updating position

    }

    svgElement.alt = `${this.iconType} icon`

    const label = document.createElement("div")
    label.classList.add("label", "title")
    label.innerText = this.iconName

    element.append(svgElement, label)

    return element

  }

  setupHierarchy() {

    const hierarchy = document.querySelector("#hierarchy")
    const hierarchyItem = document.createElement("div")
    hierarchyItem.classList.add("hierarchy-item")
    hierarchyItem.textContent = this.iconName
    hierarchy.appendChild(hierarchyItem)

    hierarchyItem.addEventListener("click", this.toggleSelection.bind(this))
    hierarchyItem.addEventListener("pointerenter", this.hover.bind(this))
    hierarchyItem.addEventListener("pointerleave", this.unhover.bind(this))

    return hierarchyItem

  }

  drawLine() {

    const lineGeometry = new LineGeometry()
    const positions = [0, 0, 0, 0, 0, 0]
    lineGeometry.setPositions(positions)

    const line = new Line2(lineGeometry, this.lineMaterial)
    line.computeLineDistances()

    const circlePoints = []
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      circlePoints.push(0.1 * Math.cos(angle), 0, 0.1 * Math.sin(angle))
    }
    
    const circleGeometry = new LineGeometry()
    circleGeometry.setPositions(circlePoints)
    const circle = new Line2(circleGeometry, this.lineMaterial)
    // circle.computeLineDistances() // Required for dashes to work - intentionally misused here
    circle.position.copy(this.groundProjection.position)
    
    line.add(circle)
    this.object.parent.add(line)

    return line

  }

  drawCone() {

    const geometry = new three.ConeGeometry(2, 6, 12, 1, true)
    const material = new three.MeshBasicMaterial({ color: 0x696969, wireframe: true, transparent: true, opacity: 0 })

    const cone = new three.Mesh(geometry, material)

    cone.position.set(0, 0, 3)
    cone.rotation.x = Math.PI * -0.5

    return cone;

  }

  updatePosition(force = false) {

        if (this.grabbing && !force) { return }

        const worldPosition = new three.Vector3()
        this.object.getWorldPosition(worldPosition)

        // ✅ Ensure yLine exists before updating
        if (this.yLine && this.yLine.geometry) {
            const positions = this.yLine.geometry.attributes.position.array
            positions[0] = worldPosition.x
            positions[1] = worldPosition.y
            positions[2] = worldPosition.z
            positions[3] = worldPosition.x
            positions[4] = 0 // ✅ Always at ground level (y = 0)
            positions[5] = worldPosition.z
            this.yLine.geometry.setPositions(positions)
            this.yLine.computeLineDistances()
            this.yLine.children[0].position.set(worldPosition.x, 0, worldPosition.z)
        }

        const pos = new three.Vector3()
        pos.setFromMatrixPosition(this.object.matrixWorld)
        pos.project(this.camera)

        const left = (pos.x * 0.5 + 0.5) * window.innerWidth
        const top = (-pos.y * 0.5 + 0.5) * window.innerHeight
        this.element.style.left = `${left}px`
        this.element.style.top =  `${top}px`

        if (this.directional && this.arrowElement) {

          const originPos = this.forward.getWorldPosition(new three.Vector3())
          originPos.project(this.camera)

          const originX = (originPos.x * 0.5 + 0.5) * window.innerWidth
          const originY = (-originPos.y * 0.5 + 0.5) * window.innerHeight

          const dx = originX - left
          const dy = originY - top
          const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  
          this.arrowElement.style.transform = `rotate(${angle}deg) translate(32px)`

          const label = this.element.querySelector(".label")
          if (Math.abs(angle) < 35) label.classList.add("left")
          else label.classList.remove("left")

      }
  }

  hover() {
    document.body.style.cursor = "grab"
    gsap.to(this.lineMaterial, { opacity: 1, linewidth: 2, duration: 0.25 })
    if (this.cone && !this.selected) {
      this.cone.material.color.set(0xF3A2FF)
      gsap.to(this.cone.material, { opacity: 1, duration: 0.5 })
    }
    if (this.boundingBox && !this.selected) {
      this.boundingBox.hover()
      new Comment(`highlighting volume bounding box`)
    }

    const label = this.element.querySelector(".label")
    label.style.opacity = 1

    new Comment(`hovering ${this.iconName}`)
    new Comment(`showing Y-axis offset indicator`)
  }

  unhover() {
    if (this.grabbing) { return }
    document.body.style.cursor = "default"
    if (!this.selected) {
      gsap.to(this.lineMaterial, { opacity: 0, duration: 0.25 })
      if (this.cone) { gsap.to(this.cone.material, { opacity: 0, duration: 0.5 }) }
      const label = this.element.querySelector(".label")
      label.style.opacity = 0
    } else { gsap.to(this.lineMaterial, { linewidth: 0.5,  duration: 0.25 }) }
    if (this.boundingBox && !this.selected) {
      this.boundingBox.unhover()
    }


    new Comment(`unhovering ${this.iconName}`)
  }

  toggleSelection() {

    if (!this.selected) {
      gsap.to(this.lineMaterial, { linewidth: 0.5, duration: 0.25 })
      this.selected = true
      this.element.classList.add("selected")
      this.hierarchyItem.classList.add("selected")
      if (this.boundingBox) {
        this.boundingBox.hover()
        this.boundingBox.select()
      }
      if (this.cone) {
        this.cone.material.color.set(0xFFFFFF)
      }
      new Comment(`selecting ${this.iconName}`)
    } else {
      gsap.to(this.lineMaterial, { linewidth: 2, duration: 0.25 })
      this.selected = false
      this.hierarchyItem.classList.remove("selected")
      this.element.classList.remove("selected")
      if (this.boundingBox) {
        this.boundingBox.unhover()
      }
      new Comment(`unselecting ${this.iconName}`)

    }

  }

  rightClick(event) {
    event.preventDefault()
    new ColorPicker(this, event)
    new Comment(`opening color picker`)
  }

  drag(event) {

    event.preventDefault()

    const delta = Math.abs(event.clientX - this.cursorStart.x) + Math.abs(event.clientY - this.cursorStart.y)
    if (!this.grabbing || (delta < 20 && !this.dragOperationStarted)) { return }

    this.dragOperationStarted = true

    const label = this.element.querySelector(".label")
    label.innerText = `(${this.object.position.x.toFixed(2)}, ${this.object.position.y.toFixed(2)}, ${this.object.position.z.toFixed(2)})`

    if (event.shiftKey) {
      
      const deltaY = event.clientY - this.cursorStart.y;
      const moveFactor = 0.01; // Adjust for sensitivity
      this.object.position.y = this.cursorStartObjectY + -deltaY * moveFactor;
      this.updatePosition(true)
      
      this.object.children.forEach(child => {
        if (child.isLine2) child.removeFromParent()
      })

      let worldPosition = new three.Vector3()
      this.object.getWorldPosition(worldPosition)
      this.groundProjection.position.set(0, worldPosition.y * -1, 0)
      // this.yLine = this.drawLine()
      this.lineMaterial.opacity = 1

      return

    }

    if (event.altKey) {
      const deltaX = event.clientX - this.cursorStart.x
      // const deltaY = event.clientY - this.cursorStart.y
      if (delta > 5) {
        this.cursorStart.x = event.clientX
        this.cursorStart.y = event.clientY
      }
      deltaX > 0 ? this.object.rotateY(Math.PI * 0.01) : this.object.rotateY(Math.PI * -0.01)
      return

    }

    // Convert screen coordinates to normalized device coordinates (NDC)
    const ndcX = (event.clientX / window.innerWidth) * 2 - 1
    const ndcY = -(event.clientY / window.innerHeight) * 2 + 1

    // Find the intersection point with the adjusted XZ plane
    this.raycaster.setFromCamera(new three.Vector2(ndcX, ndcY), this.camera)
    const objectY = this.object.position.y
    this.intersectPlane.constant = -this.object.position.y

    const intersection = new three.Vector3()
    this.raycaster.ray.intersectPlane(this.intersectPlane, intersection)

    if (!intersection) return

    this.element.style.left = `${event.clientX}px`
    this.element.style.top = `${event.clientY}px`
    this.object.position.set(intersection.x, objectY, intersection.z)

    this.helperLines.update(this.object.position)

    this.updatePosition()

  }

}