const THREE = require('three')
const Stats = require('stats.js')
require('./loaders/TGALoader')
// const { MMDLoader } = require('three-mmd-loader')
// const co = require('co')
require('./libs/mmdparser.min')
require('./libs/ammo')
require('./loaders/TGALoader')
require('./loaders/MMDLoader')
require('./effects/OutlineEffect')
require('./animation/CCDIKSolver')
require('./animation/MMDPhysics')
require('./controls/OrbitControls')

class CommonThree {
  constructor() {
    this.renderer = null
    this.width = null
    this.height = null
    this.camera = null
    this.scene = null
    this.light = null
    this.mesh = null
    this.effect = null
    this.stats = new Stats()
    this.windowHalfX = window.innerWidth / 2
    this.windowHalfY = window.innerHeight / 2
    this.clock = new THREE.Clock()
    this.helper = null
    this.ikHelper = null
    this.physicsHelper = null
    this.controls = null
    this.container = document.createElement('div')
  }
  initStats() {
    this.stats.showPanel(1)
    document.body.appendChild(this.stats.dom)
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
    this.camera.position.z = 30
  }
  initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xffffff)
  }
  initGrid() {
    let gridHelper = new THREE.PolarGridHelper(30, 10)
    gridHelper.position.y = -10
    this.scene.add(gridHelper)
  }
  initLight() {
    // 使用环境光
    let ambient = new THREE.AmbientLight(0x666666)
    this.scene.add(ambient)
    // 叠加平行光
    let directionalLight = new THREE.DirectionalLight(0x887766)
    directionalLight.position.set(-1, 1, 1).normalize()
    this.scene.add(directionalLight)
  }
  initThree() {
    document.body.appendChild(this.container)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true // 抗锯齿
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)
    this.effect = new THREE.OutlineEffect(this.renderer)
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.effect.setSize(window.innerWidth, window.innerHeight);
  }

  initObject() {
    this.importMMD()
  }

  // 导入mmd模型
  importMMD() {
    let modelFile = 'asserts/models/mmd/skeleton/Skeleton.pmx'
    let vmdFiles = ['asserts/models/mmd/vmds/wavefile_v2.vmd']
    let loader = new THREE.MMDLoader()
    this.helper = new THREE.MMDHelper()
    loader.load(modelFile, vmdFiles, object => {
      this.mesh = object
      this.mesh.position.y = -10
      this.scene.add(this.mesh)
      this.helper.add(this.mesh)
      this.helper.setAnimation(this.mesh)
      this.ikHelper = new THREE.CCDIKHelper(this.mesh)
      this.ikHelper.visible = false
      this.scene.add(this.ikHelper)
      this.helper.setPhysics(this.mesh)
      this.physicsHelper = new THREE.MMDPhysicsHelper(this.mesh)
      this.physicsHelper.visible = false
      this.scene.add(this.physicsHelper)
      this.helper.unifyAnimationDuration({ afterglow: 2.0 })
      this.helper.doAnimation = true
      this.helper.doIk = true
      this.helper.enablePhysics = true
    }, xhr => {
      if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100
        console.log(Math.round(percentComplete, 2) + '% downloaded')
      }
    }, err => {
      console.log(err)
    })
  }

  render() {
    this.helper.animate(this.clock.getDelta())
    if (this.physicsHelper != null && this.physicsHelper.visible) {
      this.physicsHelper.update()
    }
    if (this.ikHelper != null && this.ikHelper.visible) {
      this.ikHelper.update()
    }
    // this.renderer.render(this.scene, this.camera)
    this.effect.render(this.scene, this.camera)
  }

  animate() {
    this.stats.begin()
    this.render()
    this.stats.end()
    let animate = this.animate.bind(this)
    requestAnimationFrame(animate)
  }

  start() {
    this.initCamera()
    this.initScene()
    this.initGrid()
    this.initLight()
    this.initThree()
    this.initStats()
    this.initObject()
    this.animate()
  }
}

module.exports = CommonThree