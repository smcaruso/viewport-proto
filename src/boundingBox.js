import * as three from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

export default class BoundingBox extends three.Object3D {

  constructor(l, w, h) {

    super()

    const boxGeometry = new three.BoxGeometry(l, h, w)
    const edgesGeometry = new three.EdgesGeometry(boxGeometry) // Extract only the outer edges
    const edgesMaterial = new three.LineBasicMaterial({ color: 0x696969 })
    const edges = new three.LineSegments(edgesGeometry, edgesMaterial)

    this.name = "boundingBox"
    this.add(edges)

    //import volume-corner.glb with gltfLoader
    
    let cornerGeometry = new three.SphereGeometry(0.1, 32, 32)
    this.cornerMaterial = new three.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })

    const loader = new GLTFLoader()
    loader.load('/volume-corner.glb', (gltf) => {

      cornerGeometry = gltf.scene.children[0]
      cornerGeometry.scale.set(0.5, 0.5, 0.5)
      cornerGeometry.material = this.cornerMaterial

      const corners = []

      for (let i = 0; i < 8; i++) {
        corners.push(cornerGeometry.clone())
        // set position of corner based on index
        corners[i].position.x = i % 2 === 0 ? l / 2 : -l / 2
        corners[i].position.y = i % 4 < 2 ? h / 2 : -h / 2
        corners[i].position.z = i < 4 ? w / 2 : -w / 2
      }

      corners[0].rotation.set(0, Math.PI / 2, 0)
      corners[1].rotation.set(0, 0, 0)
      corners[2].rotation.set(0, Math.PI / 2, Math.PI / 2)
      corners[3].rotation.set(0, 0, Math.PI / 2)
      corners[4].rotation.set(0, Math.PI, 0)
      corners[5].rotation.set(0, Math.PI / -2, 0)
      corners[6].rotation.set(Math.PI, Math.PI / 2, 0)
      corners[7].rotation.set(Math.PI / -2, Math.PI / -2, 0)

      this.add(...corners)

    })

  }

  hover() {

    if (this.children[0] && this.children[0].type === "LineSegments") {
      this.children[0].material.color.set(0xF3A2FF)
      gsap.to(this.cornerMaterial, { opacity: 1, duration: 0.25, value: 1 })
    }

  }

  unhover() {

    if (this.children[0] && this.children[0].type === "LineSegments") {
      this.children[0].material.color.set(0x696969)
      gsap.to(this.cornerMaterial, { opacity: 0.5, duration: 0.25, value: 1 })
    }

  }

  select() {
    
    if (this.children[0] && this.children[0].type === "LineSegments") {
      this.children[0].material.color.set(0xFFFFFF)
    }
  }

}