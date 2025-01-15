import * as three from "three"
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

export default class Model extends three.Object3D {

  constructor() {
    
    super()

    const loader = new GLTFLoader()
    loader.load('/Duck.glb', (gltf) => {
      gltf.scene.children[0].translateX(-0.12)
      gltf.scene.children[0].translateY(-0.75)
      this.add(gltf.scene.children[0])
    })

  }


}