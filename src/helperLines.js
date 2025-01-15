import * as three from "three"
import { Line2 } from "three/examples/jsm/lines/Line2.js"
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js"
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js"

import gsap from "gsap"

import Comment from "./comment"

// disclaimer: this class was written almost entirely by chatGPT.

export default class HelperLines {

    constructor(object) {
        this.object = object
        this.scene = this.getScene() // Dynamically find the scene

        if (!this.scene) {
            console.warn("HelperLines: Could not find scene. Lines may not be added.")
            return
        }

        this.startPosition = new three.Vector3()

        // Create shared material for both lines
        // color: 0xF3A2FF,
        this.xMaterial = new LineMaterial({
            color: 0xff8888,
            linewidth: 0.5,
            transparent: true,
            opacity: 1,
            dashed: true,
            dashSize: 0.05,
            gapSize: 0.1,
        })

        this.zMaterial = new LineMaterial({
          color: 0xaaaaff,
          linewidth: 0.5,
          transparent: true,
          opacity: 1,
          dashed: true,
          dashSize: 0.05,
          gapSize: 0.1,
      })

        // Create X-axis movement line
        this.xGeometry = new LineGeometry()
        this.xGeometry.setPositions([0, 0, 0, 0, 0, 0]) // Placeholder points
        this.xLine = new Line2(this.xGeometry, this.xMaterial)
        this.xLine.computeLineDistances()

        // Create Z-axis movement line
        this.zGeometry = new LineGeometry()
        this.zGeometry.setPositions([0, 0, 0, 0, 0, 0]) // Placeholder points
        this.zLine = new Line2(this.zGeometry, this.zMaterial)
        this.zLine.computeLineDistances()

        // Attach to the scene dynamically
        this.scene.add(this.xLine, this.zLine)
    }

    /**
     * Finds the Three.js scene dynamically by traversing the object hierarchy.
     */
    getScene() {
      let scene = null
      this.object.traverseAncestors((ancestor) => {
          if (ancestor.isScene) {
              scene = ancestor
          }
      })
      return scene
  }

    /**
     * Starts drawing helper lines from the given position.
     * @param {three.Vector3} position - The starting position of the object.
     */
    start(position) {
        this.startPosition.copy(position)
        gsap.to(this.xMaterial, { opacity: 1, duration: 0.5 })
        gsap.to(this.zMaterial, { opacity: 1, duration: 0.5 })
        this.update(position)
        new Comment(`HelperLines.start(${position.x}, ${position.z})`)
    }

    /**
     * Updates the helper lines to reflect movement.
     * @param {three.Vector3} position - The current position of the object.
     */
    update(position) {
        if (!this.xLine.visible) return

        const fixedY = 0 // Keep Y constant

        // Update X-axis helper line
        const xPositions = [
            this.startPosition.x, fixedY, this.startPosition.z, // Fixed start position
            position.x, fixedY, this.startPosition.z,          // Move along X only
        ]
        this.xGeometry.setPositions(xPositions)
        this.xGeometry.attributes.position.needsUpdate = true

        // Update Z-axis helper line
        const zPositions = [
            position.x, fixedY, this.startPosition.z, // Fixed start position (adjusted for X)
            position.x, fixedY, position.z,          // Move along Z only
        ]
        this.zGeometry.setPositions(zPositions)
        this.zGeometry.attributes.position.needsUpdate = true
        this.xLine.computeLineDistances()
        this.zLine.computeLineDistances()
    }

    /**
     * Hides the helper lines when dragging stops.
     */
    stop() {
      gsap.to(this.xMaterial, { opacity: 0, duration: 0.5 })
      gsap.to(this.zMaterial, { opacity: 0, duration: 0.5 })
      if (this.object.position.x !== 0) {
        new Comment(`HelperLines.stop(${this.object.position.x}, ${this.object.position.z})`)
      }
    }
}