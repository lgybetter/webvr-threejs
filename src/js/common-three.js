const THREE = require('three')
const Stats = require('stats.js')

class CommonThree {
  constructor() {
    this.renderer = null
    this.width = null
    this.height = null
    this.camera = null
    this.scene = null
    this.light = null
    this.line = null
    this.stats = new Stats()
  }
  initStats () {
    this.stats.showPanel( 1 );
    document.body.appendChild( this.stats.dom );
  }
  initThree() {
    this.width = document.getElementById('canvas-frame').clientWidth
    this.height = document.getElementById('canvas-frame').clientHeight
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    })
    this.renderer.setSize(this.width, this.height)
    document.getElementById('canvas-frame').appendChild(this.renderer.domElement)
    this.renderer.setClearColor(0xFFFFFF, 1.0)
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 10000);
    this.camera.position.x = 0
    this.camera.position.y = 1000
    this.camera.position.z = 1000
    this.camera.up.x = 0
    this.camera.up.y = 0
    this.camera.up.z = 1
    this.camera.lookAt({
      x: 0,
      y: 0,
      z: 0
    })
  }
  initScene() {
    this.scene = new THREE.Scene()
  }
  initLight() {
    // 使用方向光
    this.light = new THREE.DirectionalLight(0xFF0000, 1.0, 0)
    this.light.position.set(100, 100, 200)
    // 使用环境光
    // this.light = new THREE.AmbientLight(0xFF0000)
    // this.light.position.set(100, 100, 200)
    // 使用聚光灯
    // this.light = new THREE.SpotLight(0xFF0000, 1.0, 90, 0, 0)
    // this.light.position.set(100, 100, 200)
    // 使用点光源
    this.light = new THREE.PointLight(0xFFFF00);
    this.light.position.set(0, 0, 50);
    this.scene.add(this.light)
  }
  initObject() {
    // let geometry = new THREE.Geometry()
    // let material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
    // let color1 = new THREE.Color(0x444444), color2 = new THREE.Color(0xFF0000);

    // let p1 = new THREE.Vector3(-100, 0, 100)
    // let p2 = new THREE.Vector3(100, 0, -100)
    // geometry.vertices.push(p1)
    // geometry.vertices.push(p2)
    // geometry.colors.push(color1, color2)

    // this.line = new THREE.Line(geometry, material, THREE.LineSegments)
    // this.scene.add(this.line)
    let geometry = new THREE.CubeGeometry( 200, 100, 50,4,4);
    let material = new THREE.MeshLambertMaterial( { color:0xFFFFFF} );
    let mesh1 = new THREE.Mesh( geometry,material);
    mesh1.position.set(0, 0, 0)
    this.scene.add(mesh1);
    let mesh2 = new THREE.Mesh( geometry,material);
    mesh2.position.set(100, -150, 100)
    this.scene.add(mesh2);    
    let mesh3 = new THREE.Mesh( geometry,material);
    mesh3.position.set(-200, -150, 300)
    this.scene.add(mesh3);    
    let mesh4 = new THREE.Mesh( geometry,material);
    mesh4.position.set(-200, 150, -200)
    this.scene.add(mesh4);
  }

  render() {
    this.stats.begin()
    this.renderer.clear()
    this.renderer.render(this.scene, this.camera)
    // this.line.position.x -= 1
    // this.line.position.y -= 1
    // this.line.position.z += 1
    let render = this.render.bind(this)
    this.stats.end()
    requestAnimationFrame(render)
  }

  start() {
    this.initStats()
    this.initThree()
    this.initCamera()
    this.initScene()
    this.initLight()
    this.initObject()
    this.render()
  }
}

module.exports = CommonThree