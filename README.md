# 使用TheeJS实现WebVR

## ThreeJS

### 三个必要元素： 场景(scene), 相机(camera),  渲染器(renderer)

>场景相当于舞台,相机相当于眼睛,渲染器用来把相机拍到的呈现在渲染在浏览器上

- 场景：场景提供了添加/删除物体的方法, 同时也涵盖添加雾效果以及材质覆盖等方法;

- 相机：相机提供在浏览器下以不同的角度去观看场景，常用的相机类型为：CubeCamera(立方体),  OrthographicCamera(正交),PerspectiveCamera(远景)

- 渲染器：渲染器决定了渲染的结果应该画在页面的什么元素上面，并且以怎样的方式来绘制

### 详细概念

- 相机：照相机分为两种, 使用透视投影照相机获得的结果是类似人眼在真实世界中看到的有“近大远小”的效果，而使用正交投影照相机获得的结果就像我们在数学几何学课上老师教我们画的效果，对于在三维空间内平行的线，投影到二维空间中也一定是平行的。然后创建6个透视投影相机并渲染到1个WebGL渲染器目标(WebGLRenderTarget)Cube对象上就形成了CubeCamera(立方体相机)
![enter image description here](http://os32fgzvj.bkt.clouddn.com/WX20170810-002929.png)

- 坐标系：右手坐标，需要注意物体的坐标位置与相机之间的关系
![enter image description here](http://os32fgzvj.bkt.clouddn.com/WX20170810-004930.png) 

- 光源
![enter image description here](http://os32fgzvj.bkt.clouddn.com/20130515163339_12.jpg)

>环境光：经过多次反射而来的光称为环境光，无法确定其最初的方向。环境光是一种无处不在的光。环境光源放出的光线被认为来自任何方向。因此，当你仅为场景指定环境光时，所有的物体无论法向量如何，都将表现为同样的明暗程度。
>点光源：由这种光源放出的光线来自同一点，且方向辐射自四面八方。例如蜡烛放出的光，萤火虫放出的光。
>聚光灯：这种光源的光线从一个锥体中射出，在被照射的物体上产生聚光的效果。使用这种光源需要指定光的射出方向以及锥体的顶角。
>平行光：也称方向光（Directional Light），是一组没有衰减的平行的光线，类似太阳光的效果

多种光源可以叠加进行使用，实现不同的视觉灯光效果，也可以通过控制光源来实现阴影效果。

- 渲染器
	- CanvasRenderer
	- WebGLRenderer
>Canvas渲染器不使用WebGL来绘制场景，而使用相对较慢的Canvas 2D Context API
>WebGL渲染器使用WebGL来绘制您的场景，使用WebGL将能够利用GPU硬件加速从而提高渲染性能。

### ThreeJS实现必要过程

- 初始化相机
``` javascript
initCamera() {
  // 使用远景相机PerspectiveCamera
  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
  this.camera.position.z = 30
}
```
- 初始化场景
```javascript
initScene() {
  this.scene = new THREE.Scene()
  this.scene.background = new THREE.Color(0x000000)
}
```
- 初始化光线
```javascript
initLight() {
  // 使用环境光
  let ambient = new THREE.AmbientLight(0x666666)
  // 添加光源到场景中
  this.scene.add(ambient)
  // 使用平行光
  let directionalLight = new THREE.DirectionalLight(0x887766)
  directionalLight.position.set(-1, 1, 1).normalize()
  this.scene.add(directionalLight)
}
```
- 初始化渲染器
```javascript
initRenderer() {
  // 插入DOM节点
  document.body.appendChild(this.container)
  // 使用WebGLRenderer
  this.renderer = new THREE.WebGLRenderer({
    antialias: true // 抗锯齿
  })
  // 设置像素
  this.renderer.setPixelRatio(window.devicePixelRatio)
  // 设置渲染面积
  this.renderer.setSize(window.innerWidth, window.innerHeight)
  // 渲染器renderer的domElement元素，表示渲染器中的画布，所有的渲染都是画在domElement上的
  this.container.appendChild(this.renderer.domElement)
}
``` 
- 添加一个物体
```javascript
initObject() {
  // 几何物体,一个立方体
  let geometry = new THREE.CubeGeometry(1, 1, 1);
  // 物体材质
  let material = new THREE.MeshBasicMaterial({ color: 0x00ff60 });
  // 物体实例
  this.cube = new THREE.Mesh(geometry, material); 
  this.scene.add(this.cube);
}
```
- 添加动画
```javascript
animate () {
  this.cube.rotation.x += 0.1;
  this.cube.rotation.y += 0.1;
  this.renderer.render(this.scene, this.camera)
}
```
- 循环渲染
```javascript
render () {
  this.animate()
  // 利用requestAnimationFrame()实现动画递归
  循环
  requestAnimationFrame(this.render.bind(this))
}
```
根据上面六个过程可以组合为一个通用的类来进行Three的简单使用
```javascript
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
  
  initCamera() {}
  initScene() {}
  initLight() {}
  initRenderer() {}
  initObject() {}
  render () {}
  animate () {}
  
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
```

## WebVR

### WebVR简单了解

- WebVR的体验方式
	- VR模式
		- 滑配式HMD + 移动端浏览器：浏览器水平陀螺仪的参数来获取用户的头部倾斜和转动的朝向，并告知页面需要渲染哪一个朝向的场景，移动端需使用Chrome Beta版本的浏览器
		- 分离式HMD + PC端浏览器：佩戴Oculus Rift的分离式头显浏览连接在PC主机端的网页，没有体验过。。。
	- 裸眼模式： 使用鼠标拖拽场景

### 实现WebVR准备工作

>需要引入的js插件：
1. webvr-polyfill.js：需要引入webvr-polyfill.js来支持WebVR网页，它提供了大量VR相关的API，比如Navigator.getVRDevices()获取VR头显信息的方法
2. VRcontrols.js：VR控制器，是three.js的一个相机控制器对象，引入VRcontrols.js可以根据用户在空间的朝向渲染场景，它通过调用WebVR API的orientation值控制camera的rotation属性
3. VReffect.js：VR分屏器，这是three.js的一个场景分屏的渲染器，提供戴上VR头显的显示方式，VREffect.js重新创建了左右两个相机，对场景做二次渲染，产生双屏效果。
4. webvr-manager.js：这是WebVR的方案适配插件，它提供PC端和移动端的两种适配方式，通过new WebVRManager()可以生成一个VR图标，提供VR模式和裸眼模式的不同体验，当用户在移动端点击按钮进入VR模式时，WebVRManager便会调用VREffect分屏器进行分屏，而退出VR模式时，WebVRManager便用回renderer渲染器进行单屏渲染。

### 初始化VR控件

```javascript
initVR() {

  this.effect = new THREE.VREffect(this.renderer)
  this.controls = new THREE.VRControls(this.camera)
  this.manager = new WebVRManager(this.renderer, this.effect)
}
```

```javascript
// 动画渲染更新
render() {
  if (this.ready) {
    this.helper.animate(this.clock.getDelta())
    if (this.physicsHelper != null && this.physicsHelper.visible) {
      // 物理重力等效果
      this.physicsHelper.update()
    }
    // 加载MMD模型时使用
    if (this.ikHelper != null && this.ikHelper.visible) {
      this.ikHelper.update()
    }
    // 使控制器能够实时更新
    this.controls.update()
    // this.renderer.render(this.scene, this.camera)
    this.manager.render(this.scene, this.camera)
  }
}
```

## WebVR结合ThreeJS发生的碰撞

### 导入MMD模型

- 引入MMD模型解析脚本
  - MMDParser.js
  - TGALoader.js
  - MMDLoader.js
  - CCDIKSolver.js
  - MMDPhysics.js

```javascript
// 导入mmd模型
importMMD() {
  // 模型文件路径
  let modelFile = 'asserts/models/mmd/bikini-miku/sakura.pmx'
  // 模型动作文件
  let vmdFiles = ['asserts/models/mmd/vmds/power.vmd']
  // 背景音乐文件
  let audioFile = 'asserts/models/mmd/audios/power.mp3'
  let audioParams = { delayTime: 0 }
  // 新建一个loader用于加载mmd模型
  let loader = new THREE.MMDLoader()
  this.helper = new THREE.MMDHelper()
  // 异步加载文件
  loader.load(modelFile, vmdFiles, object => {
    this.mesh = object
    this.mesh.position.y = -10
    // this.scene.add(this.mesh)
    this.helper.add(this.mesh)
    // 设置模型动画
    this.helper.setAnimation(this.mesh)
    this.ikHelper = new THREE.CCDIKHelper(this.mesh)
    this.ikHelper.visible = false
    this.scene.add(this.ikHelper)
    // 设置模型物理动效
    this.helper.setPhysics(this.mesh)
    this.physicsHelper = new THREE.MMDPhysicsHelper(this.mesh)
    this.physicsHelper.visible = false
    this.scene.add(this.physicsHelper)
    this.helper.doAnimation = true
    this.helper.doIk = true
    this.helper.enablePhysics = true
    // 加载音乐
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
```
