const THREE = require('three')

class BaseThree {
  constructor() {
    this.renderer = null
    this.width = null
    this.height = null
    this.camera = null
    this.scene = null
    this.light = null
    this.windowHalfX = window.innerWidth / 2
    this.windowHalfY = window.innerHeight / 2
    this.container = document.createElement('div')
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
    this.camera.position.z = 30
  }
  initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)
  }
  initLight() {
    let ambient = new THREE.AmbientLight(0x666666)
    this.scene.addd(ambient)
    let directionalLight = new THREE.DirectionalLight(0x887766)
    directionalLight.position.set(-1, 1, 1).normalize()
    this.scene.add(directionalLight)
  }
  initRenderer() {
    document.body.appendChild(this.container)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true // 抗锯齿
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)
  }
  initObject() {
    // 几何物体
    let geometry = new THREE.CubeGeometry(1, 1, 1);
    // 物体材质
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // 物体实例
    this.cube = new THREE.Mesh(geometry, material); 
    scene.add(this.cube);
  }

  render () {
    this.animate()
    requestAnimationFrame(this.render.bind(this))
  }

  animate () {
    this.cube.rotation.x += 0.1;
    this.cube.rotation.y += 0.1;
    this.renderer.render(this.scene, this.camera)
  }

  start () {
    // 初始化
    this.initCamera()
    this.initScene()
    this.initLight()
    this.initRenderer()
    this.initObject()
    // 开始渲染
    this.render()
  }
}