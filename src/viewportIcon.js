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

    this.colors = {
      icon: "#797979",

    }
    this.iconColor = "#797979"
    this.iconBGOpacity = "ff"

    this.element = this.drawElement()
    this.hierarchyItem = this.setupHierarchy()
    this.yLine = this.drawLine()
    this.selected = false

    this.boundingBox = null

    if (type === "rigidbody") {
      this.boundingBox = new BoundingBox(2, 2, 1)
      this.object.add(this.boundingBox)
    }

    document.querySelector("#app").appendChild(this.element)

    this.element.addEventListener("click", this.click.bind(this))
    this.element.addEventListener("pointerenter", this.hover.bind(this))
    this.element.addEventListener("pointerleave", this.unhover.bind(this))

  }

  drawElement() {

    const element = document.createElement("div")
    element.classList.add("viewport-icon")
    element.style.background = this.iconColor + this.iconBGOpacity

    const svgElement = document.createElement("img")

    switch (this.iconType) {
      case "audio":
        svgElement.src = audio
        break
      case "box":
        svgElement.src = box
        break
      case "camera":
        svgElement.src = camera
        break
      case "cylinder":
        svgElement.src = cylinder
        break
      case "directional":
        svgElement.src = directional
        break
      case "envmap":
        svgElement.src = envmap
        break
      case "hemisphere":
        svgElement.src = hemisphere
        break
      case "mountpoint":
        svgElement.src = mountpoint
        break
      case "point":
        svgElement.src = point
        break
      case "portal":
        svgElement.src = portal
        break
      case "rigidbody":
        svgElement.src = rigidbody
        break
      case "spawnpoint":
        svgElement.src = spawnpoint
        break
      case "sphere":
        svgElement.src = sphere
        break
      case "spot":
        svgElement.src = spot
        break
      case "trigger":
        svgElement.src = trigger
        break
      case "video":
        svgElement.src = video
        break
    }

    if (this.directional) {

      const arrow = document.createElement("div")
      arrow.classList.add("viewport-arrow")
      arrow.style.background = this.iconColor + this.iconBGOpacity

      const arrowHead = document.createElement("div")
      arrowHead.classList.add("viewport-arrowhead")
      arrowHead.style.borderLeft = `16px solid ${this.iconColor + this.iconBGOpacity}`

      arrow.appendChild(arrowHead)
      element.appendChild(arrow)

      this.arrowElement = arrow // Store reference for updating position

    }

    svgElement.alt = `${this.iconType} icon`
    element.appendChild(svgElement)

    return element

  }

  drawLine() {

    const lineMaterial = new LineMaterial({ color: 0xffffff, dashed: true, linewidth: 2, dashSize: 0.1, gapSize: 0.075, transparent: true, opacity: 0 })

    const lineGeometry = new LineGeometry()
    const points = [new three.Vector3(0, 0, 0), this.groundProjection.position ]
    lineGeometry.setFromPoints(points)

    const line = new Line2(lineGeometry, lineMaterial)
    line.computeLineDistances()

    const circlePoints = [];
    for (let i = 0; i <= 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        circlePoints.push(0.1 * Math.cos(angle), 0, 0.1 * Math.sin(angle));
    }

    const circleGeometry = new LineGeometry();
    circleGeometry.setPositions(circlePoints);
    const circle = new Line2(circleGeometry, lineMaterial);
    // circle.computeLineDistances(); // Required for dashes to work
    circle.position.copy(this.groundProjection.position)

    this.object.add(line, circle)

    return line
  }

  updatePosition() {
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
      }
  }

  hover() {
    gsap.to(this.yLine.material, { opacity: 1, linewidth: 2, duration: 0.25 })
    if (this.boundingBox && !this.selected) {
      this.boundingBox.hover()
    }
  }

  unhover() {
    if (!this.selected) { gsap.to(this.yLine.material, { opacity: 0, duration: 0.25 })
    } else { gsap.to(this.yLine.material, { linewidth: 0.5,  duration: 0.25 }) }
    if (this.boundingBox && !this.selected) {
      this.boundingBox.unhover()
    }
  }

  click() {

    if (!this.selected) {
      gsap.to(this.yLine.material, { linewidth: 0.5, duration: 0.25 })
      this.selected = true
      this.element.classList.add("selected")
      this.hierarchyItem.classList.add("selected")
      if (this.boundingBox) {
        this.boundingBox.hover()
        this.boundingBox.select()
      }
    } else {
      gsap.to(this.yLine.material, { linewidth: 2, duration: 0.25 })
      this.selected = false
      this.hierarchyItem.classList.remove("selected")
      this.element.classList.remove("selected")
      if (this.boundingBox) {
        this.boundingBox.unhover()
      }
    }

  }

  setupHierarchy() {

    const hierarchy = document.querySelector("#hierarchy")
    const hierarchyItem = document.createElement("div")
    hierarchyItem.classList.add("hierarchy-item")
    hierarchyItem.textContent = this.iconName
    hierarchy.appendChild(hierarchyItem)

    hierarchyItem.addEventListener("click",this.click.bind(this))

    return hierarchyItem

  }

}