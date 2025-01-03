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

import * as THREE from "three"

export default class ViewportIcon {

  constructor(name, type, object, camera, directional = false) {

    this.iconName = name
    this.iconType = type
    this.object = object // is Object3D
    this.directional = directional
    this.arrowElement = null

    this.camera = camera

    this.iconColor = "#FFFFFF59"

    this.element = this.drawElement()
    this.hierarchyItem = this.setupHierarchy()
    this.yLine = this.drawLine()
    this.selected = false
    
    
    document.querySelector("#app").appendChild(this.element)
    document.querySelector("#app").appendChild(this.yLine)

    this.element.addEventListener("click", this.click.bind(this))
    this.element.addEventListener("pointerenter", this.hover.bind(this))
    this.element.addEventListener("pointerleave", this.unhover.bind(this))

  }

  drawElement() {

    const element = document.createElement("div")
    element.classList.add("viewport-icon")
    element.style.background = this.iconColor

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

      const arrow = document.createElement("div");
      arrow.classList.add("viewport-arrow");
      arrow.style.background = `linear-gradient(to right, #ffffff00 49%, ${this.iconColor} 49%)`

      const arrowHead = document.createElement("div");
      arrowHead.classList.add("viewport-arrowhead");
      arrowHead.style.borderLeft = `12px solid ${this.iconColor}`;

      arrow.appendChild(arrowHead);
      element.appendChild(arrow);


      this.arrowElement = arrow; // Store reference for updating position

    }

    svgElement.alt = `${this.iconType} icon`
    element.appendChild(svgElement)

    return element

  }

  drawLine() {
    const line = document.createElement("div")
    line.classList.add("viewport-line")

    return line
  }

  updatePosition() {
        const pos = new THREE.Vector3()
        pos.setFromMatrixPosition(this.object.matrixWorld)
        pos.project(this.camera)

        const left = (pos.x * 0.5 + 0.5) * window.innerWidth
        const top = (-pos.y * 0.5 + 0.5) * window.innerHeight
        this.element.style.left = `${left}px`
        this.element.style.top =  `${top}px`

        // Project the ground position (same X, Z but Y = 0)
        const groundPos = new THREE.Vector3(this.object.position.x, 0, this.object.position.z)
        groundPos.project(this.camera)
      
        // const groundX = (groundPos.x * 0.5 + 0.5) * window.innerWidth
        const groundTop = (-groundPos.y * 0.5 + 0.5) * window.innerHeight
      
        this.yLine.style.left = `${left}px`
        this.yLine.style.top = `${top + 36}px`
        this.yLine.style.height = `${groundTop - (top + 36)}px`

        if (this.directional && this.arrowElement) {

          const originPos = new THREE.Vector3(0, 0, 0);
          originPos.project(this.camera);

          const originX = (originPos.x * 0.5 + 0.5) * window.innerWidth;
          const originY = (-originPos.y * 0.5 + 0.5) * window.innerHeight;

          const dx = originX - left;
          const dy = originY - top;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
          this.arrowElement.style.transform = `rotate(${angle}deg)`;
      }
  }

  hover() {
    this.yLine.classList.add("show")
  }

  unhover() {
    if (!this.selected) { this.yLine.classList.remove("show") }
  }

  click() {

    if (!this.selected) {
      this.selected = true
      this.hierarchyItem.classList.add("selected")
      this.yLine.classList.add("show")
    } else {
      this.selected = false
      this.hierarchyItem.classList.remove("selected")
      this.yLine.classList.remove("show")
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