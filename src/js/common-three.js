const THREE = require('three')
const Stats = require('stats.js')
require('./polyfill/webvr-polyfill')
require('./controls/VRControls')
require('./effects/VREffect')
const WebVRManager = require('./manager/webvr-manager')
require('./loaders/TGALoader')
// const { MMDLoader } = require('three-mmd-loader')
// const co = require('co')
require('./libs/mmdparser.min')
// require('./libs/ammo')
require('./loaders/TGALoader')
require('./loaders/MMDLoader')
require('./effects/OutlineEffect')
require('./animation/CCDIKSolver')
require('./animation/MMDPhysics')
// require('./controls/OrbitControls')

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
    this.manager = null
    this.stats = new Stats()
    this.ready = false
    this.windowHalfX = window.innerWidth / 2
    this.windowHalfY = window.innerHeight / 2
    this.clock = new THREE.Clock()
    this.helper = null
    this.ikHelper = null
    this.physicsHelper = null
    this.controls = null
    this.container = document.createElement('div')
  }

  /*************************************************************
   *  Three Js 部分
   *************************************************************/

  // 实时状态器
  initStats() {
    this.stats.showPanel(1)
    document.body.appendChild(this.stats.dom)
  }
  // 摄像机
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
    this.camera.position.z = 30
  }
  // 场景
  initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)
  }
  // 底部布局
  initGrid(width = 1000, height = 1000) {
    // let gridHelper = new THREE.PolarGridHelper(30, 10)
    // gridHelper.position.y = -10
    // this.scene.add(gridHelper)

    // let groundPlane = new THREE.PlaneBufferGeometry(width, height)
    // let groundMetirial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
    // let ground = new THREE.Mesh(groundPlane, groundMetirial)
    // ground.rotation.x = - Math.PI / 2
    // ground.position.y = -10
    // ground.receiveShadow = true
    // this.scene.add(ground)
    let r = "asserts/textures/cube/Park3Med/"
    let urls = [
      r + "px.jpg", r + "nx.jpg",
      r + "py.jpg", r + "ny.jpg",
      r + "pz.jpg", r + "nz.jpg"
    ]
    let textureCube = new THREE.CubeTextureLoader().load(urls)
    textureCube.format = THREE.RGBFormat
    textureCube.mapping = THREE.CubeReflectionMapping
    let cubeShader = THREE.ShaderLib["cube"]
    let cubeMaterial = new THREE.ShaderMaterial({
      fragmentShader: cubeShader.fragmentShader,
      vertexShader: cubeShader.vertexShader,
      uniforms: cubeShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    })
    cubeMaterial.uniforms["tCube"].value = textureCube
    let cubeMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 100, 100), cubeMaterial)

    let textureLoader = new THREE.TextureLoader()
    let textureEquirec = textureLoader.load("asserts/textures/kkxl.jpg")
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping
    textureEquirec.magFilter = THREE.LinearFilter
    textureEquirec.minFilter = THREE.LinearMipMapLinearFilter
    let equirectShader = THREE.ShaderLib["equirect"]
    let equirectMaterial = new THREE.ShaderMaterial({
      fragmentShader: equirectShader.fragmentShader,
      vertexShader: equirectShader.vertexShader,
      uniforms: equirectShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    })
    equirectMaterial.uniforms["tEquirect"].value = textureEquirec
    // cubeMesh.material = equirectMaterial
    
    this.scene.add(cubeMesh)
  }
  // 光线
  initLight() {
    // 使用环境光
    let ambient = new THREE.AmbientLight(0x666666)
    this.scene.add(ambient)
    // 叠加平行光
    let directionalLight = new THREE.DirectionalLight(0x887766)
    directionalLight.position.set(-1, 1, 1).normalize()
    this.scene.add(directionalLight)
  }
  // 渲染器渲染
  initThree() {
    document.body.appendChild(this.container)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true // 抗锯齿
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)
    // this.effect = new THREE.OutlineEffect(this.renderer)
    // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
  }

  // 监听窗口变化事件
  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2
    this.windowHalfY = window.innerHeight / 2
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.effect.setSize(window.innerWidth, window.innerHeight)
  }

  // 物体对象
  initObject() {
    this.importMMD()
  }

  // 导入mmd模型
  importMMD() {
    let modelFile = 'asserts/models/mmd/bikini-miku/sakura.pmx'
    let vmdFiles = ['asserts/models/mmd/vmds/power.vmd']
    let audioFile = 'asserts/models/mmd/audios/power.mp3'
    let audioParams = { delayTime: 0 }
    let loader = new THREE.MMDLoader()
    this.helper = new THREE.MMDHelper()
    loader.load(modelFile, vmdFiles, object => {
      this.mesh = object
      this.mesh.position.y = -10
      // this.scene.add(this.mesh)
      this.helper.add(this.mesh)
      this.helper.setAnimation(this.mesh)
      this.ikHelper = new THREE.CCDIKHelper(this.mesh)
      this.ikHelper.visible = false
      this.scene.add(this.ikHelper)
      this.helper.setPhysics(this.mesh)
      this.physicsHelper = new THREE.MMDPhysicsHelper(this.mesh)
      this.physicsHelper.visible = false
      this.scene.add(this.physicsHelper)
      this.helper.doAnimation = true
      this.helper.doIk = true
      this.helper.enablePhysics = true
      loader.loadAudio(audioFile, (audio, listener) => {
        listener.position.z = 1
        this.helper.setAudio(audio, listener, audioParams)
        this.helper.unifyAnimationDuration({ afterglow: 2.0 })
        this.scene.add(audio)
        this.scene.add(listener)
        this.scene.add(this.mesh)
        this.ready = true
      }, xhr => {
        if (xhr.lengthComputable) {
          var percentComplete = xhr.loaded / xhr.total * 100
          console.log(Math.round(percentComplete, 2) + '% downloaded')
        }
      }, err => {
        console.log(err)
      })
    }, xhr => {
      if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100
        console.log(Math.round(percentComplete, 2) + '% downloaded')
      }
    }, err => {
      console.log(err)
    })
  }

  // 动画渲染更新
  render() {
    if (this.ready) {
      this.helper.animate(this.clock.getDelta())
      if (this.physicsHelper != null && this.physicsHelper.visible) {
        this.physicsHelper.update()
      }
      if (this.ikHelper != null && this.ikHelper.visible) {
        this.ikHelper.update()
      }
      this.controls.update()
      // this.renderer.render(this.scene, this.camera)
      this.manager.render(this.scene, this.camera)
    }
  }

  // 刷帧
  animate() {
    this.stats.begin()
    this.render()
    this.stats.end()
    let animate = this.animate.bind(this)
    requestAnimationFrame(animate)
  }

  /*************************************************************
   *  Web VR 部分
   *************************************************************/

  // 创建准心，用于模拟VR
  createCrosshair() {
    let crosshair = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.04, 32), new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true
    }))
    crosshair.position.z = -2
    this.camera.add(crosshair)
  }

  // 初始化VR控件
  initVR() {

    this.effect = new THREE.VREffect(this.renderer)
    this.controls = new THREE.VRControls(this.camera)
    this.manager = new WebVRManager(this.renderer, this.effect)
  }

  initEvent() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false)
  }

  // 开始入口函数
  start() {
    this.initCamera()
    this.createCrosshair()
    this.initScene()
    this.initGrid(1000, 1000)
    this.initLight()
    this.initThree()
    this.initVR()
    this.initEvent()
    this.initStats()
    this.initObject()
    this.initVR()
    this.animate()
  }
}

module.exports = CommonThree