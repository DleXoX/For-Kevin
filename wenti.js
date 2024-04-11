import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

var scene = new THREE.Scene();
// 创建一个具有透视的相机
var camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

// 创建一个渲染器，并添加到HTML文档中
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
console.log("gl");
console.log(renderer.capabilities.isWebGL2);

// 创建控制器，允许通过鼠标进行场景旋转
var controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);


var point = [1,2,3,-4,5,6,15,2,6];


// 创建自定义几何体
var geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(point, 3));


var texdata = new Uint32Array(16  * 2);
var texdata_c = new Uint8Array(texdata.buffer);
//分别用8位存rgba
texdata_c[0] = 151;
texdata_c[1] = 20;
texdata_c[2] = 255;
texdata_c[3] = 255;

console.log("texdata");
console.log(texdata);

var texture = new THREE.DataTexture(texdata.buffer, 32, 1, THREE.RGBAIntegerFormat, THREE.UnsignedIntType);
texture.needsUpdate = true;
texture.internalFormat='RGBA32UI';
console.log("texture.internalFormat");
console.log(texture.internalFormat);
// 创建ShaderMaterial
var material = new THREE.ShaderMaterial({
  vertexShader: `
    
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_PointSize = 5.0; // 设置点的大小为3个像素
      gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
    }
  `,
  fragmentShader: `
  precision highp float;
  precision highp int;

  uniform highp sampler2D myTexture;
    varying vec3 vPosition;
    void main() {

    uvec4 cov = texelFetch(myTexture, ivec2(0, 0), 0);
    // 从一个uint32中取出rgba
    vec4 vColor = (vec4((cov.x) & 0xffu, 
                        (cov.x >> 8) & 0xffu, 
                        (cov.x >> 16) & 0xffu, 
                        (cov.x >> 24) & 0xffu) )/ 255.0;
    
    // 将转换后的颜色值赋给gl_FragColor
    gl_FragColor = vColor;

    //gl_FragColor = vec4(1.0,0.0,0.0,1.0);//用于测试，红色点
    }
  `.trim(),
  blending: THREE.AdditiveBlending, // 使用加法混合模式，适用于点云
  transparent: true, // 允许透明
  uniforms: {
    mytexture: { value: texture }
  }
});

// 创建点云对象
var pointCloud = new THREE.Points(geometry, material);
scene.add(pointCloud);

// 创建一个坐标轴帮助器并添加到场景中
var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 创建一个动画循环
function animate() {
  requestAnimationFrame(animate);
  // 更新控制器
  controls.update();
  // 渲染场景
  renderer.render(scene, camera);
}

// 开始动画循环
animate();
